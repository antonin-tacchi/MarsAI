import * as JuryMember from '../models/JuryMember.js';

// ============================================================
// CONTROLLER: JuryMember
// Description: Gestion des profils des jurys (pas de création/suppression)
// Note: Les users sont créés via le système d'invitation
// ============================================================

/**
 * GET /api/jury-members
 * Récupérer tous les membres du jury (PUBLIC)
 * Utilisé par la page /membres-du-jury
 */
export const getAllJuryMembers = async (req, res) => {
  try {
    const members = await JuryMember.findAll();

    // Formater les données pour le frontend
    const formattedMembers = members.map(member => ({
      id: member.id,
      name: member.name,
      image_url: member.profile_picture,
      role: member.role_title,
      description: member.bio
    }));

    res.json({
      success: true,
      data: formattedMembers
    });
  } catch (error) {
    console.error('Erreur getAllJuryMembers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des membres du jury'
    });
  }
};

/**
 * GET /api/jury-members/:id
 * Récupérer un membre spécifique (PUBLIC ou ADMIN)
 */
export const getJuryMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await JuryMember.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Membre du jury non trouvé'
      });
    }

    // Formater les données
    const formattedMember = {
      id: member.id,
      name: member.name,
      email: member.email,
      image_url: member.profile_picture,
      role: member.role_title,
      description: member.bio,
      created_at: member.created_at
    };

    res.json({
      success: true,
      data: formattedMember
    });
  } catch (error) {
    console.error('Erreur getJuryMemberById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * PUT /api/jury-members/:id/profile
 * Mettre à jour le profil d'un jury (ADMIN ONLY)
 * Permet de modifier: photo, role_title, bio
 */
export const updateJuryProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_title, bio } = req.body;

    // Vérifier que le membre existe et est un jury
    const isJury = await JuryMember.isJuryMember(id);
    if (!isJury) {
      return res.status(404).json({
        success: false,
        message: 'Membre du jury non trouvé'
      });
    }

    // Préparer les updates
    const updates = {};

    // Validation et ajout des champs
    if (role_title !== undefined) {
      if (role_title.length < 2 || role_title.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Le titre du rôle doit contenir entre 2 et 255 caractères'
        });
      }
      updates.role_title = role_title;
    }

    if (bio !== undefined) {
      if (bio && bio.length > 5000) {
        return res.status(400).json({
          success: false,
          message: 'La bio ne peut pas dépasser 5000 caractères'
        });
      }
      updates.bio = bio;
    }

    // Nouvelle photo uploadée (optionnelle)
    if (req.file) {
      updates.profile_picture = '/uploads/jury/' + req.file.filename;
      // TODO: Supprimer l'ancienne photo du serveur
    }

    // Vérifier qu'il y a au moins un champ à mettre à jour
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour'
      });
    }

    // Mettre à jour
    await JuryMember.updateProfile(id, updates);

    res.json({
      success: true,
      message: 'Profil du jury mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur updateJuryProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour'
    });
  }
};

/**
 * GET /api/jury-members-stats
 * Statistiques sur les membres du jury (ADMIN ONLY)
 */
export const getJuryStats = async (req, res) => {
  try {
    const total = await JuryMember.count();

    res.json({
      success: true,
      data: {
        total_members: total
      }
    });
  } catch (error) {
    console.error('Erreur getJuryStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};