export function toCatalogStatsDTO({
  total,
  byStatus,
  byCategory,
  byCountry,
  byAiTool,
}) {
  return {
    total: Number(total),

    // byStatus: byStatus.map(r => ({
    //   status: r.status,
    //   count: Number(r.count),
    // })),

    byCategory: byCategory.map(r => ({
      categoryId: r.categoryId ?? null,
      name: r.name,
      count: Number(r.count),
    })),

    byCountry: byCountry.map(r => ({
      country: r.country,
      count: Number(r.count),
    })),

    byAiTool: byAiTool.map(r => ({
      tool: r.tool,
      count: Number(r.count),
    })),
  };
}
