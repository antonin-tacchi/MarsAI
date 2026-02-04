// src/controllers/catalogStats.controller.js
import CatalogRepository from "../repositories/catalogStats.repository.js";
import { toCatalogStatsDTO } from "../dtos/catalogStats.dto.js";

export async function getCatalogStats(req, res) {
  try {
    console.log("HIT stats");

    const total = await CatalogRepository.countAll();
    const byCategory = await CatalogRepository.countByCategory();
    const byCountry = await CatalogRepository.countByCountry();
    const byAiTool = await CatalogRepository.countByAiTool();

    const data = toCatalogStatsDTO({
      total,
      byCategory,
      byCountry,
      byAiTool,
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("❌ getCatalogStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Catalog stats failed",
      error: err?.message,
    });
  }
}
