import JuryAssignment from "../models/JuryAssignment.js";
import {
  distributeFilms,
  DistributionError,
} from "../services/filmDistribution.js";

/**
 * POST /api/superjury/generate
 * Body: { R: number, Lmax: number }
 * Génère la répartition des films pour les jurys.
 */
export const generateDistribution = async (req, res) => {
  try {
    const R = parseInt(req.body.R, 10);
    const Lmax = parseInt(req.body.Lmax, 10);

    if (!R || R < 1 || R > 20) {
      return res.status(400).json({
        success: false,
        message: "R doit être entre 1 et 20",
      });
    }

    if (!Lmax || Lmax < 1 || Lmax > 500) {
      return res.status(400).json({
        success: false,
        message: "Lmax doit être entre 1 et 500",
      });
    }

    // Récupérer les données
    const [films, juries, existingRatings] = await Promise.all([
      JuryAssignment.getAllFilms(),
      JuryAssignment.getAllJuries(),
      JuryAssignment.getExistingRatingsMap(),
    ]);

    if (!films.length) {
      return res.status(400).json({
        success: false,
        message: "Aucun film à répartir",
      });
    }

    if (!juries.length) {
      return res.status(400).json({
        success: false,
        message: "Aucun jury disponible (rôle Jury)",
      });
    }

    // Lancer l'algorithme
    const { assignments, stats } = distributeFilms(
      films,
      juries,
      R,
      Lmax,
      existingRatings
    );

    // Supprimer les anciennes assignations et insérer les nouvelles
    await JuryAssignment.clearAll();

    if (assignments.length) {
      await JuryAssignment.bulkCreate(assignments, req.user.userId);
    }

    return res.status(200).json({
      success: true,
      message: `Répartition générée : ${assignments.length} assignations`,
      data: {
        R,
        Lmax,
        stats,
      },
    });
  } catch (error) {
    if (error instanceof DistributionError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("generateDistribution error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la génération",
    });
  }
};

/**
 * GET /api/superjury/overview
 * Récupère les stats actuelles de la répartition.
 */
export const getDistributionOverview = async (req, res) => {
  try {
    const overview = await JuryAssignment.getDistributionOverview();

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error("getDistributionOverview error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

/**
 * GET /api/superjury/preview
 * Query: ?R=3&Lmax=70
 * Simule la répartition sans l'appliquer.
 */
export const previewDistribution = async (req, res) => {
  try {
    const R = parseInt(req.query.R, 10);
    const Lmax = parseInt(req.query.Lmax, 10);

    if (!R || R < 1 || R > 20) {
      return res.status(400).json({
        success: false,
        message: "R doit être entre 1 et 20",
      });
    }

    if (!Lmax || Lmax < 1 || Lmax > 500) {
      return res.status(400).json({
        success: false,
        message: "Lmax doit être entre 1 et 500",
      });
    }

    const [films, juries, existingRatings] = await Promise.all([
      JuryAssignment.getAllFilms(),
      JuryAssignment.getAllJuries(),
      JuryAssignment.getExistingRatingsMap(),
    ]);

    if (!films.length) {
      return res.status(400).json({
        success: false,
        message: "Aucun film à répartir",
      });
    }

    if (!juries.length) {
      return res.status(400).json({
        success: false,
        message: "Aucun jury disponible",
      });
    }

    const { stats } = distributeFilms(films, juries, R, Lmax, existingRatings);

    return res.status(200).json({
      success: true,
      message: "Aperçu de la répartition (non appliquée)",
      data: { R, Lmax, stats },
    });
  } catch (error) {
    if (error instanceof DistributionError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("previewDistribution error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};
