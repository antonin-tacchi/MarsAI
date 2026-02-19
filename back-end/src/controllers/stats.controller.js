import Stats from "../models/Stats.js";

/**
 * Get overview statistics
 * GET /api/admin/stats/overview
 */
export const getOverviewStats = async (req, res) => {
  try {
    const stats = await Stats.getOverviewStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get overview stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving overview statistics",
    });
  }
};

/**
 * Get film distribution by country
 * GET /api/admin/stats/by-country
 */
export const getStatsByCountry = async (req, res) => {
  try {
    const stats = await Stats.getStatsByCountry();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get stats by country error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving country statistics",
    });
  }
};

/**
 * Get film distribution by category
 * GET /api/admin/stats/by-category
 */
export const getStatsByCategory = async (req, res) => {
  try {
    const stats = await Stats.getStatsByCategory();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get stats by category error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving category statistics",
    });
  }
};

/**
 * Get AI usage statistics
 * GET /api/admin/stats/ai-usage
 */
export const getAIUsageStats = async (req, res) => {
  try {
    const stats = await Stats.getAIUsageStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get AI usage stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving AI usage statistics",
    });
  }
};

/**
 * Get submission timeline (films per month)
 * GET /api/admin/stats/timeline?months=6
 */
export const getSubmissionTimeline = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;

    // Validate months parameter
    if (months < 1 || months > 24) {
      return res.status(400).json({
        success: false,
        message: "Months parameter must be between 1 and 24",
      });
    }

    const stats = await Stats.getSubmissionTimeline(months);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get submission timeline error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving submission timeline",
    });
  }
};

/**
 * Get top rated films
 * GET /api/admin/stats/top-rated?limit=10
 */
export const getTopRatedFilms = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Validate limit parameter
    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Limit parameter must be between 1 and 50",
      });
    }

    const films = await Stats.getTopRatedFilms(limit);

    return res.status(200).json({
      success: true,
      data: films,
    });
  } catch (error) {
    console.error("Get top rated films error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving top rated films",
    });
  }
};

/**
 * Get jury activity statistics
 * GET /api/admin/stats/jury-activity
 */
export const getJuryActivityStats = async (req, res) => {
  try {
    const stats = await Stats.getJuryActivityStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get jury activity stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving jury activity statistics",
    });
  }
};

/**
 * Get all statistics in one call (dashboard overview)
 * GET /api/admin/stats/all
 */
export const getAllStats = async (req, res) => {
  try {
    const stats = await Stats.getAllStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get all stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving statistics",
    });
  }
};