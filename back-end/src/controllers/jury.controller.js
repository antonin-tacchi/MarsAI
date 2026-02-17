import JuryRating from "../models/JuryRating.js";
import Film from "../models/Film.js";
import JuryAssignment from "../models/JuryAssignment.js";

// Get all approved films for jury to rate
export const getFilmsForJury = async (req, res) => {
  try {
    const userId = req.user.userId;
    const filmsWithRatings = await Film.findApprovedWithRatings(userId);

    return res.status(200).json({
      success: true,
      data: filmsWithRatings,
    });
  } catch (err) {
    console.error("getFilmsForJury error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single film with jury details
export const getFilmForJury = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const film = await Film.findByIdWithRatings(id, userId);
    if (!film) {
      return res.status(404).json({ success: false, message: "Film not found" });
    }

    return res.status(200).json({
      success: true,
      data: film,
    });
  } catch (err) {
    console.error("getFilmForJury error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Submit or update a rating (0-10)
export const submitRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 10",
      });
    }

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({ success: false, message: "Film not found" });
    }

    await JuryRating.create(id, userId, ratingNum, comment || null);

    const avgData = await JuryRating.getAverageRating(id);

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        film_id: id,
        rating: ratingNum,
        comment: comment || null,
        average_rating: avgData.average,
        total_ratings: avgData.count,
      },
    });
  } catch (err) {
    console.error("submitRating error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user's rating history
export const getMyRatings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const ratings = await JuryRating.findByUser(userId);
    return res.status(200).json({ success: true, data: ratings });
  } catch (err) {
    console.error("getMyRatings error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a rating
export const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleted = await JuryRating.delete(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }

    return res.status(200).json({ success: true, message: "Rating deleted" });
  } catch (err) {
    console.error("deleteRating error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get film ranking based on jury ratings
export const getResults = async (req, res) => {
  try {
    const ranking = await JuryRating.getRanking();

    return res.status(200).json({
      success: true,
      data: ranking,
    });
  } catch (err) {
    console.error("getResults error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Jury Assignments
export const getAssignedFilmsForJury = async (req, res) => {
  try {
    const juryId = req.user?.userId;
    if (!juryId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const all = String(req.query.all || "") === "1";

    const limit = all
      ? 50
      : Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const offset = all ? 0 : (page - 1) * limit;

    const sortOrder = req.query.sortOrder || "DESC";

    const [{ rows, count }, stats] = await Promise.all([
      JuryAssignment.findAssignedFilms({ juryId, limit, offset, sortOrder }),
      JuryAssignment.getJuryStats(juryId),
    ]);

    return res.status(200).json({
      success: true,
      data: rows,
      stats: {
        totalAssigned: Number(stats.total_assigned || 0),
        totalUnrated: Number(stats.total_unrated || 0),
        totalRated: Number(stats.total_rated || 0),
      },
      pagination: {
        totalItems: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
        currentPage: all ? 1 : page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("getAssignedFilmsForJury error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving assigned films",
    });
  }
};
