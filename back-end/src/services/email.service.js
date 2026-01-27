import nodemailer from "nodemailer";

/**
 * Email Service - Send notifications to film submitters
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize the email transporter
   */
  init() {
    if (this.initialized) return;

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn("⚠️  Email credentials not configured. Emails will be logged but not sent.");
      this.initialized = true;
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass, // Use App Password for Gmail
      },
    });

    this.initialized = true;
    console.log("✅ Email service initialized");
  }

  /**
   * Send an email
   */
  async send(to, subject, html) {
    this.init();

    const mailOptions = {
      from: `"MarsAI Festival" <${process.env.EMAIL_USER || "noreply@marsai.com"}>`,
      to,
      subject,
      html,
    };

    // If no transporter, just log the email
    if (!this.transporter) {
      console.log("📧 [EMAIL LOG] Would send email:");
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      return { success: true, logged: true };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send submission confirmation email
   */
  async sendSubmissionConfirmation(film) {
    const subject = `MarsAI Festival - Soumission reçue : ${film.title}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #262335; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .highlight { color: #463699; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MarsAI Festival</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${film.director_firstname} ${film.director_lastname},</h2>
            <p>Nous avons bien recu votre soumission pour le film :</p>
            <p class="highlight" style="font-size: 18px;">${film.title}</p>
            <p>Votre film est actuellement <strong>en attente de validation</strong> par notre équipe.</p>
            <p>Vous recevrez un email dès que le statut de votre soumission sera mis à jour.</p>
            <br>
            <p>Merci de votre participation au MarsAI Festival !</p>
          </div>
          <div class="footer">
            <p>MarsAI Festival - Marseille, La Plateforme</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send(film.director_email, subject, html);
  }

  /**
   * Send approval notification email
   */
  async sendApprovalNotification(film) {
    const subject = `MarsAI Festival - Votre film "${film.title}" a été accepté !`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #262335; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .success { background-color: #4CAF50; color: white; padding: 10px 20px; display: inline-block; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MarsAI Festival</h1>
          </div>
          <div class="content">
            <h2>Felicitations ${film.director_firstname} ${film.director_lastname} !</h2>
            <p><span class="success">ACCEPTÉ</span></p>
            <p>Nous avons le plaisir de vous annoncer que votre film <strong>"${film.title}"</strong> a été sélectionné pour participer au MarsAI Festival !</p>
            <p>Votre film sera présenté lors de notre prochaine édition.</p>
            <p>Nous vous contacterons prochainement avec plus de détails sur les prochaines étapes.</p>
            <br>
            <p>Encore félicitations et à très bientôt !</p>
            <p>L'équipe MarsAI Festival</p>
          </div>
          <div class="footer">
            <p>MarsAI Festival - Marseille, La Plateforme</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send(film.director_email, subject, html);
  }

  /**
   * Send rejection notification email
   */
  async sendRejectionNotification(film) {
    const subject = `MarsAI Festival - Décision concernant "${film.title}"`;
    const reasonSection = film.rejection_reason
      ? `<p><strong>Raison :</strong> ${film.rejection_reason}</p>`
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #262335; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MarsAI Festival</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${film.director_firstname} ${film.director_lastname},</h2>
            <p>Nous vous remercions d'avoir soumis votre film <strong>"${film.title}"</strong> au MarsAI Festival.</p>
            <p>Après examen attentif, nous avons le regret de vous informer que votre film n'a pas été retenu pour cette édition.</p>
            ${reasonSection}
            <p>Nous vous encourageons à continuer votre travail créatif et à soumettre de nouveaux projets lors de nos prochaines éditions.</p>
            <br>
            <p>Merci de votre compréhension et de votre participation.</p>
            <p>L'équipe MarsAI Festival</p>
          </div>
          <div class="footer">
            <p>MarsAI Festival - Marseille, La Plateforme</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send(film.director_email, subject, html);
  }

  /**
   * Send invitation email to new admin/jury member
   */
  async sendInvitation(invitation, invitedByName) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteUrl = `${frontendUrl}/invite/${invitation.token}`;
    const roleName = invitation.roleId === 2 ? "Administrateur" : "Membre du Jury";

    const subject = `MarsAI Festival - Invitation a rejoindre l'equipe`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #262335; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; background-color: #463699; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .highlight { color: #463699; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MarsAI Festival</h1>
          </div>
          <div class="content">
            <h2>Bonjour${invitation.name ? ` ${invitation.name}` : ""} !</h2>
            <p>Vous avez ete invite(e) par <strong>${invitedByName}</strong> a rejoindre l'equipe du MarsAI Festival en tant que :</p>
            <p class="highlight" style="font-size: 20px;">${roleName}</p>
            <p>Pour activer votre compte, cliquez sur le bouton ci-dessous et definissez votre mot de passe :</p>
            <p style="text-align: center;">
              <a href="${inviteUrl}" class="button" style="color: white;">Activer mon compte</a>
            </p>
            <p style="font-size: 12px; color: #666;">Ce lien est valable pendant 7 jours.</p>
            <p style="font-size: 12px; color: #666;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>${inviteUrl}</p>
          </div>
          <div class="footer">
            <p>MarsAI Festival - Marseille, La Plateforme</p>
            <p>Si vous n'avez pas demande cette invitation, ignorez cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send(invitation.email, subject, html);
  }
}

export default new EmailService();
