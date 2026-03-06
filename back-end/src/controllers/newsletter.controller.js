import crypto from "crypto";
import pool from "../config/database.js";
import { sendNewsletterConfirmation, sendNewsletterBatch } from "../services/email.service.js";

// ─── Subscribe ───────────────────────────────────────────────

export const subscribe = async (req, res) => {
  try {
    const { email, lang = "fr" } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Email invalide" });
    }

    // Vérifier si déjà inscrit et confirmé
    const [existing] = await pool.execute(
      "SELECT id, confirmed FROM newsletter_subscribers WHERE email = ?",
      [email]
    );

    if (existing.length > 0 && existing[0].confirmed) {
      return res.status(409).json({ success: false, message: "Déjà inscrit à la newsletter" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    if (existing.length > 0) {
      // Mettre à jour le token de confirmation
      await pool.execute(
        "UPDATE newsletter_subscribers SET confirm_token = ?, token_expires_at = ?, lang = ? WHERE email = ?",
        [token, expiresAt, lang, email]
      );
    } else {
      await pool.execute(
        "INSERT INTO newsletter_subscribers (email, lang, confirm_token, token_expires_at) VALUES (?, ?, ?, ?)",
        [email, lang, token, expiresAt]
      );
    }

    await sendNewsletterConfirmation({ to: email, token, lang });

    res.json({
      success: true,
      message: lang === "fr"
        ? "Un email de confirmation a été envoyé."
        : "A confirmation email has been sent.",
    });
  } catch (error) {
    console.error("Erreur subscribe:", error);
    res.status(500).json({ success: false, message: "Erreur lors de l'inscription" });
  }
};

// ─── Confirm subscription ────────────────────────────────────

export const confirmSubscription = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) return res.status(400).json({ success: false, message: "Token manquant" });

    const [rows] = await pool.execute(
      "SELECT * FROM newsletter_subscribers WHERE confirm_token = ? AND token_expires_at > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Token invalide ou expiré" });
    }

    await pool.execute(
      "UPDATE newsletter_subscribers SET confirmed = 1, confirm_token = NULL, token_expires_at = NULL, confirmed_at = NOW() WHERE confirm_token = ?",
      [token]
    );

    res.json({ success: true, message: "Inscription confirmée !" });
  } catch (error) {
    console.error("Erreur confirmSubscription:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ─── Unsubscribe ─────────────────────────────────────────────

export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) return res.status(400).json({ success: false, message: "Email manquant" });

    await pool.execute(
      "UPDATE newsletter_subscribers SET confirmed = 0, unsubscribed_at = NOW() WHERE email = ?",
      [email]
    );

    res.json({ success: true, message: "Désinscription effectuée." });
  } catch (error) {
    console.error("Erreur unsubscribe:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ─── Get all subscribers (ADMIN) ─────────────────────────────

export const getSubscribers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, email, lang, confirmed, confirmed_at, created_at FROM newsletter_subscribers ORDER BY created_at DESC"
    );
    const confirmed = rows.filter((r) => r.confirmed).length;
    res.json({ success: true, total: rows.length, confirmed, data: rows });
  } catch (error) {
    console.error("Erreur getSubscribers:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ─── Send newsletter (ADMIN) ─────────────────────────────────

export const sendNewsletterAdmin = async (req, res) => {
  try {
    const { subject, htmlContent } = req.body;

    if (!subject || !htmlContent) {
      return res.status(400).json({ success: false, message: "Sujet et contenu requis" });
    }

    // Récupérer uniquement les abonnés confirmés
    const [subscribers] = await pool.execute(
      "SELECT email, lang FROM newsletter_subscribers WHERE confirmed = 1"
    );

    if (subscribers.length === 0) {
      return res.status(400).json({ success: false, message: "Aucun abonné confirmé" });
    }

    const result = await sendNewsletterBatch({ subscribers, subject, htmlContent });

    res.json({
      success: true,
      message: `Newsletter envoyée à ${result.sent}/${result.total} abonnés`,
      ...result,
    });
  } catch (error) {
    console.error("Erreur sendNewsletter:", error);
    res.status(500).json({ success: false, message: "Erreur envoi newsletter" });
  }
};