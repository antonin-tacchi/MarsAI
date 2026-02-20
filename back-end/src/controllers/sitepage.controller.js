import SitePage from "../models/SitePage.js";

// Public: get page content by slug
export const getPageContent = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || !slug.trim()) {
      return res.status(400).json({ success: false, message: "Slug is required" });
    }

    const page = await SitePage.findBySlug(slug.trim());

    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        slug: page.slug,
        content_fr: page.content_fr,
        content_en: page.content_en,
        updated_at: page.updated_at,
      },
    });
  } catch (err) {
    console.error("getPageContent error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Erreur lors de la récupération du contenu",
    });
  }
};

// Admin: update page content
export const updatePageContent = async (req, res) => {
  try {
    const { slug } = req.params;
    const { content_fr, content_en } = req.body;

    if (!slug || !slug.trim()) {
      return res.status(400).json({ success: false, message: "Slug is required" });
    }

    if (!content_fr && !content_en) {
      return res.status(400).json({
        success: false,
        message: "At least one language content is required",
      });
    }

    const userId = req.user?.userId;
    const updated = await SitePage.update(slug.trim(), content_fr, content_en, userId);

    return res.status(200).json({
      success: true,
      message: "Contenu mis à jour avec succès",
      data: updated,
    });
  } catch (err) {
    console.error("updatePageContent error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Erreur lors de la mise à jour du contenu",
    });
  }
};
