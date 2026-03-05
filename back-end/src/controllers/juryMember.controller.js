import * as JuryMember from '../models/JuryMember.js';
import { buildKey, uploadBuffer, deleteObject } from '../services/scalewayStorage.service.js';
import { signGetUrl } from '../services/scalewaySignedUrl.service.js';

// Génère une signed URL pour la photo d'un membre
async function withSignedPhoto(member) {
  if (!member) return null;
  const signedUrl = member.profile_picture_key
    ? await signGetUrl(member.profile_picture_key)
    : member.profile_picture || null;
  return { ...member, profile_picture: signedUrl };
}

/* Récupérer tous les membres du jury (PUBLIC) */
export const getAllJuryMembers = async (req, res) => {
  try {
    const members = await JuryMember.findAll();

    const formatted = await Promise.all(members.map(async (member) => {
      const signed = await withSignedPhoto(member);
      return {
        id: signed.id,
        name: signed.name,
        image_url: signed.profile_picture,
        role: signed.role_title,
        description: signed.bio,
      };
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Erreur getAllJuryMembers:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des membres du jury' });
  }
};

export const getJuryMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await JuryMember.findById(id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Membre du jury non trouvé' });
    }

    const signed = await withSignedPhoto(member);
    res.json({
      success: true,
      data: {
        id: signed.id,
        name: signed.name,
        email: signed.email,
        image_url: signed.profile_picture,
        role: signed.role_title,
        description: signed.bio,
        created_at: signed.created_at,
      },
    });
  } catch (error) {
    console.error('Erreur getJuryMemberById:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/* Mettre à jour le profil d'un jury (ADMIN ONLY) */
export const updateJuryProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_title, bio } = req.body;

    const isJury = await JuryMember.isJuryMember(id);
    if (!isJury) {
      return res.status(404).json({ success: false, message: 'Membre du jury non trouvé' });
    }

    const updates = {};

    if (role_title !== undefined) {
      if (role_title.length < 2 || role_title.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Le titre du rôle doit contenir entre 2 et 255 caractères',
        });
      }
      updates.role_title = role_title;
    }

    if (bio !== undefined) {
      if (bio && bio.length > 5000) {
        return res.status(400).json({ success: false, message: 'La bio ne peut pas dépasser 5000 caractères' });
      }
      updates.bio = bio;
    }

    if (req.file) {
      const existing = await JuryMember.findById(id);
      const oldKey = existing?.profile_picture_key || null;

      const key = buildKey('jury/photos', req.file.originalname);
      const { url } = await uploadBuffer({
        buffer: req.file.buffer,
        key,
        contentType: req.file.mimetype,
      });

      updates.profile_picture = url;
      updates.profile_picture_key = key;

      if (oldKey) await deleteObject(oldKey).catch(() => {});
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
    }

    await JuryMember.updateProfile(id, updates);

    // Retourner le profil complet avec signed URL
    const updated = await JuryMember.findById(id);
    const signed = await withSignedPhoto(updated);

    res.json({
      success: true,
      message: 'Profil du jury mis à jour avec succès',
      data: {
        id: signed.id,
        name: signed.name,
        image_url: signed.profile_picture,
        role: signed.role_title,
        description: signed.bio,
      },
    });
  } catch (error) {
    console.error('Erreur updateJuryProfile:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
  }
};

/* (ADMIN ONLY) */
export const getJuryStats = async (req, res) => {
  try {
    const total = await JuryMember.count();
    res.json({ success: true, data: { total_members: total } });
  } catch (error) {
    console.error('Erreur getJuryStats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
  }
};