// back-end/src/controllers/festivalConfig.controller.js
import FestivalConfig from "../models/FestivalConfig.js";

export async function getActiveFestivalConfig(req, res) {
  try {
    const config = await FestivalConfig.getActive();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "No active festival config found",
      });
    }

    return res.json({
      success: true,
      data: config,
    });
  } catch (err) {
    console.error("getActiveFestivalConfig error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}