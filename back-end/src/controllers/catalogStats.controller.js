import CatalogRepository from "../repositories/catalogStats.repository.js";
import { toCatalogStatsDTO } from "../dtos/catalogStats.dto.js";

/* CATALOG STATS */

export async function getCatalogStats(req, res) {
  try {
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Catalog stats failed",
    });
  }
}
