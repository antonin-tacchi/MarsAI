import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_ADDRESS =
  process.env.SMTP_FROM || "MarsAI Festival <noreply@marsai.com>";

/**
 * Send a rejection email to the director explaining why their film was refused.
 */
export async function sendRejectionEmail(film, rejectionReason) {
  if (!process.env.SMTP_USER) {
    console.warn(
      "SMTP_USER not configured – skipping rejection email for film",
      film.id
    );
    return;
  }

  const directorEmail = film.director_email;
  if (!directorEmail) {
    console.warn("No director email for film", film.id);
    return;
  }

  const directorName =
    [film.director_firstname, film.director_lastname].filter(Boolean).join(" ") ||
    "Réalisateur";

  const mailOptions = {
    from: FROM_ADDRESS,
    to: directorEmail,
    subject: `MarsAI Festival – Votre film "${film.title}" n'a pas été retenu`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #262335;">
        <h2 style="color: #262335;">Bonjour ${directorName},</h2>

        <p>
          Nous vous remercions d'avoir soumis votre film
          <strong>"${film.title}"</strong> au festival MarsAI.
        </p>

        <p>
          Après examen, nous avons le regret de vous informer que votre film
          n'a pas été retenu pour cette édition.
        </p>

        ${
          rejectionReason
            ? `
        <div style="background: #f8f4f0; border-left: 4px solid #463699; padding: 12px 16px; margin: 20px 0;">
          <strong>Raison :</strong><br/>
          ${rejectionReason.replace(/\n/g, "<br/>")}
        </div>`
            : ""
        }

        <p>
          Nous vous encourageons à soumettre de nouveau lors de la prochaine
          édition. N'hésitez pas à nous contacter si vous avez des questions.
        </p>

        <p>Cordialement,<br/><strong>L'équipe MarsAI Festival</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${directorEmail} for film ${film.id}`);
  } catch (err) {
    console.error("Failed to send rejection email:", err.message);
  }
}
