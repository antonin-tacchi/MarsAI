import JuryRating from "../models/JuryRating.js";
import Film from "../models/Film.js";

// Get all approved films for jury to rate
export const getFilmsForJury = async (req, res) => {
  try {
    const films = await Film.findAllApproved();
    const userId = req.user.userId;

    const filmsWithRatings = await Promise.all(
      films.map(async (film) => {
        const rating = await JuryRating.findByFilmAndUser(film.id, userId);
        const avgData = await JuryRating.getAverageRating(film.id);
        return {
          ...film,
          user_rating: rating?.rating ?? null,
          user_comment: rating?.comment ?? null,
          average_rating: avgData.average,
          total_ratings: avgData.count,
        };
      })
    );

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

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({ success: false, message: "Film not found" });
    }

    const rating = await JuryRating.findByFilmAndUser(id, userId);
    const avgData = await JuryRating.getAverageRating(id);
    const allRatings = await JuryRating.findByFilm(id);

    return res.status(200).json({
      success: true,
      data: {
        ...film,
        user_rating: rating?.rating ?? null,
        user_comment: rating?.comment ?? null,
        average_rating: avgData.average,
        total_ratings: avgData.count,
        all_ratings: allRatings,
      },
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
