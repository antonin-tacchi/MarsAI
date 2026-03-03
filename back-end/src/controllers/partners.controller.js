import Partner from "../models/Partner.js";

const validate = (data, isUpdate = false) => {
    const errors = [];
    
    if (!isUpdate || data.name !== undefined) {
        if (!data.name || data.name.trim().length < 2) errors.push("Nom requis (min 2 caractères)");
        else if (data.name.length > 255) errors.push("Nom trop long (max 255)");
    }
    
    if (!isUpdate || data.logo !== undefined) {
        if (!data.logo) errors.push("Logo requis");
        else if (data.logo.length > 500) errors.push("URL logo trop longue");
        else {
            try { new URL(data.logo); } 
            catch { errors.push("Logo doit être une URL valide"); }
        }
    }
    
    if (!isUpdate || data.url !== undefined) {
        if (!data.url) errors.push("URL site requise");
        else if (data.url.length > 500) errors.push("URL site trop longue");
        else {
            try { new URL(data.url); } 
            catch { errors.push("URL site doit être valide"); }
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
        res.json({ success: true, count: partners.length, data: partners });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur récupération partenaires" });
    }
};

export const getPartnerById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "ID invalide" });
        
        const partner = await Partner.getById(parseInt(id));
        if (!partner) return res.status(404).json({ success: false, message: "Partenaire introuvable" });
        
        res.json({ success: true, data: partner });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur récupération partenaire" });
    }
};

export const createPartner = async (req, res) => {
    try {
        const validation = validate(req.body);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: "Données invalides", errors: validation.errors });
        }
        
        const newPartner = await Partner.create(req.body);
        res.status(201).json({ success: true, message: "Partenaire créé", data: newPartner });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur création partenaire" });
    }
};

export const updatePartner = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "ID invalide" });
        
        const validation = validate(req.body, true);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: "Données invalides", errors: validation.errors });
        }
        
        const updated = await Partner.update(parseInt(id), req.body);
        if (!updated) return res.status(404).json({ success: false, message: "Partenaire introuvable" });
        
        res.json({ success: true, message: "Partenaire mis à jour", data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur mise à jour partenaire" });
    }
};

export const deletePartner = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "ID invalide" });
        
        const deleted = await Partner.delete(parseInt(id));
        if (!deleted) return res.status(404).json({ success: false, message: "Partenaire introuvable" });
        
        res.json({ success: true, message: "Partenaire supprimé" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur suppression partenaire" });
    }
};