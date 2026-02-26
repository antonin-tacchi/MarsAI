import * as JuryMember from '../models/JuryMember.js';

/* Récupérer tous les membres du jury (PUBLIC) */
export const getAllJuryMembers = async (req, res) => {
  try {
    const members = await JuryMember.findAll();
    const formattedMembers = members.map(member => ({
      id: member.id,
      name: member.name,
      image_url: member.profile_picture,
      role: member.role_title,
      description: member.bio
    }));

    res.json({
      success: true,
      data: formattedMembers
    });
  } catch (error) {
    console.error('Erreur getAllJuryMembers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des membres du jury'
    });
  }
};

export const getJuryMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await JuryMember.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Membre du jury non trouvé'
      });
    }

    const formattedMember = {
      id: member.id,
      name: member.name,
      email: member.email,
      image_url: member.profile_picture,
      role: member.role_title,
      description: member.bio,
      created_at: member.created_at
    };

    res.json({
      success: true,
      data: formattedMember
    });
  } catch (error) {
    console.error('Erreur getJuryMemberById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/* Mettre à jour le profil d'un jury (ADMIN ONLY) */
export const updateJuryProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_title, bio } = req.body;
    const isJury = await JuryMember.isJuryMember(id);
    if (!isJury) {
      return res.status(404).json({
        success: false,
        message: 'Membre du jury non trouvé'
      });
    }

    const updates = {};

    // Validation et ajout des champs
    if (role_title !== undefined) {
      if (role_title.length < 2 || role_title.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Le titre du rôle doit contenir entre 2 et 255 caractères'
        });
      }
      updates.role_title = role_title;
    }

    if (bio !== undefined) {
      if (bio && bio.length > 5000) {
        return res.status(400).json({
          success: false,
          message: 'La bio ne peut pas dépasser 5000 caractères'
        });
      }
      updates.bio = bio;
    }

    if (req.file) {
      updates.profile_picture = '/uploads/jury/' + req.file.filename;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour'
      });
    }

    await JuryMember.updateProfile(id, updates);

    res.json({
      success: true,
      message: 'Profil du jury mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur updateJuryProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour'
    });
  }
};

/* (ADMIN ONLY) */
export const getJuryStats = async (req, res) => {
  try {
    const total = await JuryMember.count();

    res.json({
      success: true,
      data: {
        total_members: total
      }
    });
  } catch (error) {
    console.error('Erreur getJuryStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};