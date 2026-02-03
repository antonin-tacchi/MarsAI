import FilmRepository from "../repositories/films.repository.js";
import { toCatalogStatsDTO } from "../dtos/catalogStats.dto.js";

export async function getCatalogStats(req, res) {
  const total = await FilmRepository.countAll();
  const byCategory = await FilmRepository.countByCategory();
  const byCountry = await FilmRepository.countByCountry();
  const byAiTool = await FilmRepository.countByAiTool();

  const data = toCatalogStatsDTO({
    total,
    byCategory,
    byCountry,
    byAiTool,
  });

  res.json({ success: true, data });
}
