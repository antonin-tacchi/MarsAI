import Partner from "../models/Partner.js";
import { buildKey, uploadBuffer, deleteObject } from "../services/scalewayStorage.service.js";
import { signGetUrl } from "../services/scalewaySignedUrl.service.js";

// Enrichit un partenaire avec une signed URL si logo_key existe
async function withSignedLogo(partner) {
  if (!partner) return null;
  const signedUrl = partner.logo_key
    ? await signGetUrl(partner.logo_key)
    : partner.logo; // fallback sur l'URL stockée (ex: URL externe)
  return { ...partner, logo: signedUrl };
}

const validate = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.trim().length < 2) errors.push("Nom requis (min 2 caractères)");
    else if (data.name.length > 255) errors.push("Nom trop long (max 255)");
  }

  // Logo : requis à la création seulement si aucun fichier uploadé
  if (!isUpdate && !data._hasFile) {
    if (!data.logo) errors.push("Logo requis (fichier ou URL)");
  }

  // Si logo fourni en tant qu'URL (pas de fichier), on valide l'URL
  if (data.logo && !data._hasFile) {
    if (data.logo.length > 500) errors.push("URL logo trop longue");
    else {
      try { new URL(data.logo); }
      catch { errors.push("Logo doit être une URL valide"); }
    }
  }

  if (!isUpdate || data.url !== undefined) {
    if (!data.url) errors.push("URL site requise");
    else {
      // Auto-préfixer https:// si manquant
      if (!/^https?:\/\//i.test(data.url)) data.url = "https://" + data.url;
      if (data.url.length > 500) errors.push("URL site trop longue");
      else {
        try { new URL(data.url); }
        catch { errors.push("URL site doit être valide"); }
      }
    }
  }

  if (data.display_order !== undefined && (isNaN(data.display_order) || data.display_order < 0)) {
    errors.push("Ordre d'affichage invalide");
  }

  return { valid: errors.length === 0, errors };
};

export const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.getAll();
    // Génère une signed URL pour chaque partenaire ayant un logo_key Scaleway
    const signed = await Promise.all(partners.map(withSignedLogo));
    res.json({ success: true, count: signed.length, data: signed });
  } catch (error) {
    console.error("Erreur getAllPartners:", error);
    res.status(500).json({ success: false, message: "Erreur récupération partenaires" });
  }
};

export const getPartnerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "ID invalide" });

    const partner = await Partner.getById(parseInt(id));
    if (!partner) return res.status(404).json({ success: false, message: "Partenaire introuvable" });

    const signed = await withSignedLogo(partner);
    res.json({ success: true, data: signed });
  } catch (error) {
    console.error("Erreur getPartnerById:", error);
    res.status(500).json({ success: false, message: "Erreur récupération partenaire" });
  }
};

export const createPartner = async (req, res) => {
  try {
    const body = { ...req.body, _hasFile: !!req.file };

    if (req.file) {
      const key = buildKey("partners/logos", req.file.originalname);
      const { url } = await uploadBuffer({
        buffer: req.file.buffer,
        key,
        contentType: req.file.mimetype,
      });
      body.logo = url;
      body.logo_key = key;
    }

    const validation = validate(body);
    if (!validation.valid) {
      if (body.logo_key) await deleteObject(body.logo_key).catch(() => {});
      return res.status(400).json({ success: false, message: "Données invalides", errors: validation.errors });
    }

    const newPartner = await Partner.create(body);
    const signed = await withSignedLogo(newPartner);
    res.status(201).json({ success: true, message: "Partenaire créé", data: signed });
  } catch (error) {
    console.error("Erreur createPartner:", error);
    res.status(500).json({ success: false, message: "Erreur création partenaire" });
  }
};

export const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "ID invalide" });

    const body = { ...req.body, _hasFile: !!req.file };
    let oldLogoKey = null;

    if (req.file) {
      const existing = await Partner.getById(parseInt(id));
      if (existing?.logo_key) oldLogoKey = existing.logo_key;

      const key = buildKey("partners/logos", req.file.originalname);
      const { url } = await uploadBuffer({
        buffer: req.file.buffer,
        key,
        contentType: req.file.mimetype,
      });
      body.logo = url;
      body.logo_key = key;
    }

    const validation = validate(body, true);
    if (!validation.valid) {
      if (req.file && body.logo_key) await deleteObject(body.logo_key).catch(() => {});
      return res.status(400).json({ success: false, message: "Données invalides", errors: validation.errors });
    }

    const updated = await Partner.update(parseInt(id), body);
    if (!updated) {
      if (req.file && body.logo_key) await deleteObject(body.logo_key).catch(() => {});
      return res.status(404).json({ success: false, message: "Partenaire introuvable" });
    }

    if (oldLogoKey) await deleteObject(oldLogoKey).catch(() => {});

    const signed = await withSignedLogo(updated);
    res.json({ success: true, message: "Partenaire mis à jour", data: signed });
  } catch (error) {
    console.error("Erreur updatePartner:", error);
    res.status(500).json({ success: false, message: "Erreur mise à jour partenaire" });
  }
};

export const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "ID invalide" });

    const partner = await Partner.getById(parseInt(id));
    const deleted = await Partner.delete(parseInt(id));
    if (!deleted) return res.status(404).json({ success: false, message: "Partenaire introuvable" });

    if (partner?.logo_key) await deleteObject(partner.logo_key).catch(() => {});

    res.json({ success: true, message: "Partenaire supprimé" });
  } catch (error) {
    console.error("Erreur deletePartner:", error);
    res.status(500).json({ success: false, message: "Erreur suppression partenaire" });
  }
};