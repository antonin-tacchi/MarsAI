import { Resend } from "resend";

let _resend = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to your .env file to enable email sending."
      );
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.RESEND_FROM || "onboarding@resend.dev";

// En dev, redirige tous les emails vers cette adresse (domaine non vérifié Resend)
const DEV_RECIPIENT = process.env.RESEND_DEV_RECIPIENT || null;
const to_ = (email) => {
  const resolved = DEV_RECIPIENT || email;
  console.log("[Resend] to_ resolved:", JSON.stringify(resolved), "| DEV_RECIPIENT:", JSON.stringify(DEV_RECIPIENT), "| original:", JSON.stringify(email));
  return resolved;
};
const APP_NAME = "MarsAI Festival";
const APP_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

// ─── Templates HTML ──────────────────────────────────────────

const baseTemplate = (content, lang = "fr") => `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#FBF5F0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF5F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(38,35,53,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#262335;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-1px;">${APP_NAME}</h1>
            <p style="margin:6px 0 0;color:#8A83DA;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Festival International du Film IA</p>
          </td>
        </tr>
        <!-- Content -->
        <tr><td style="padding:40px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F5F0EB;padding:24px 40px;text-align:center;border-top:1px solid #E8E2DB;">
            <p style="margin:0;color:#262335;opacity:0.4;font-size:12px;">© ${new Date().getFullYear()} ${APP_NAME} · Marseille</p>
            <p style="margin:6px 0 0;color:#262335;opacity:0.3;font-size:11px;">
              ${lang === "fr" ? "Vous recevez cet email car vous êtes inscrit sur notre plateforme." : "You receive this email because you are registered on our platform."}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (url, text) => `
  <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:#463699;border-radius:10px;padding:14px 32px;">
        <a href="${url}" style="color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;">${text}</a>
      </td>
    </tr>
  </table>`;

const h2 = (text) => `<h2 style="margin:0 0 16px;color:#262335;font-size:22px;font-weight:800;">${text}</h2>`;
const p = (text) => `<p style="margin:0 0 12px;color:#262335;font-size:15px;line-height:1.6;opacity:0.8;">${text}</p>`;
const box = (content) => `<div style="background:#F5F0EB;border-radius:10px;padding:16px 20px;margin:16px 0;">${content}</div>`;
const divider = () => `<hr style="border:none;border-top:1px solid #E8E2DB;margin:24px 0;"/>`;

// ─── 1. Email de bienvenue jury ───────────────────────────────

export async function sendJuryWelcome({ to, name, password, lang = "fr" }) {
  const loginUrl = `${APP_URL}/login`;
  const isFr = lang === "fr";

  const content = `
    ${h2(isFr ? `Bienvenue dans le jury, ${name} 👋` : `Welcome to the jury, ${name} 👋`)}
    ${p(isFr
      ? "Vous avez été sélectionné(e) comme membre du jury du MarsAI Festival. Voici vos identifiants de connexion :"
      : "You have been selected as a jury member of the MarsAI Festival. Here are your login credentials:"
    )}
    ${box(`
      <p style="margin:0 0 6px;font-size:13px;color:#262335;opacity:0.5;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Email</p>
      <p style="margin:0 0 12px;font-size:16px;color:#262335;font-weight:600;">${to}</p>
      <p style="margin:0 0 6px;font-size:13px;color:#262335;opacity:0.5;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${isFr ? "Mot de passe temporaire" : "Temporary password"}</p>
      <p style="margin:0;font-size:20px;color:#463699;font-weight:900;letter-spacing:2px;font-family:monospace;">${password}</p>
    `)}
    ${p(isFr
      ? "⚠️ Vous devrez changer votre mot de passe lors de votre première connexion."
      : "⚠️ You will be required to change your password upon first login."
    )}
    ${btn(loginUrl, isFr ? "Accéder à la plateforme" : "Access the platform")}
    ${divider()}
    ${p(isFr
      ? "Si vous avez des questions, contactez l'équipe d'organisation."
      : "If you have any questions, please contact the organizing team."
    )}`;

  console.log("[Resend] Sending jury welcome to:", to);
  console.log("[Resend] API Key set:", !!process.env.RESEND_API_KEY);
  console.log("[Resend] FROM:", FROM);
  const result = await getResend().emails.send({
    from: FROM,
    to: to_(to),
    subject: isFr ? `🎬 Vos accès jury — ${APP_NAME}` : `🎬 Your jury access — ${APP_NAME}`,
    html: baseTemplate(content, lang),
  });
  console.log("[Resend] Result:", JSON.stringify(result));
  return result;
}

// ─── 2. Réinitialisation mot de passe (forgot password) ──────

export async function sendPasswordReset({ to, name, token, lang = "fr" }) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const isFr = lang === "fr";

  const content = `
    ${h2(isFr ? "Réinitialisation de mot de passe" : "Password reset")}
    ${p(isFr
      ? `Bonjour ${name}, nous avons reçu une demande de réinitialisation de votre mot de passe.`
      : `Hello ${name}, we received a request to reset your password.`
    )}
    ${btn(resetUrl, isFr ? "Réinitialiser mon mot de passe" : "Reset my password")}
    ${box(`<p style="margin:0;font-size:13px;color:#262335;opacity:0.6;">${
      isFr
        ? "⏱ Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email."
        : "⏱ This link expires in <strong>1 hour</strong>. If you did not request this reset, please ignore this email."
    }</p>`)}
    ${divider()}
    ${p(`<span style="font-size:13px;opacity:0.5;">${
      isFr
        ? `Si le bouton ne fonctionne pas, copiez ce lien : <a href="${resetUrl}" style="color:#463699;">${resetUrl}</a>`
        : `If the button doesn't work, copy this link: <a href="${resetUrl}" style="color:#463699;">${resetUrl}</a>`
    }</span>`)}`;

  console.log("[Resend] Sending password reset to:", to);
  console.log("[Resend] API Key set:", !!process.env.RESEND_API_KEY);
  const result = await getResend().emails.send({
    from: FROM,
    to: to_(to),
    subject: isFr ? `🔐 Réinitialisation de mot de passe — ${APP_NAME}` : `🔐 Password reset — ${APP_NAME}`,
    html: baseTemplate(content, lang),
  });
  console.log("[Resend] Result:", JSON.stringify(result));
  return result;
}

// ─── 3. Confirmation inscription newsletter ───────────────────

export async function sendNewsletterConfirmation({ to, token, lang = "fr" }) {
  const confirmUrl = `${APP_URL}/newsletter/confirm?token=${token}`;
  const isFr = lang === "fr";

  const content = `
    ${h2(isFr ? "Confirmez votre inscription 🎬" : "Confirm your subscription 🎬")}
    ${p(isFr
      ? "Merci de votre intérêt pour le MarsAI Festival ! Cliquez sur le bouton ci-dessous pour confirmer votre inscription à notre newsletter."
      : "Thank you for your interest in the MarsAI Festival! Click the button below to confirm your newsletter subscription."
    )}
    ${btn(confirmUrl, isFr ? "Confirmer mon inscription" : "Confirm my subscription")}
    ${box(`<p style="margin:0;font-size:13px;color:#262335;opacity:0.6;">${
      isFr
        ? "⏱ Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas demandé cette inscription, ignorez cet email."
        : "⏱ This link expires in <strong>24 hours</strong>. If you did not request this subscription, please ignore this email."
    }</p>`)}`;

  console.log("[Resend] Sending newsletter confirm to:", to);
  const result = await getResend().emails.send({
    from: FROM,
    to: to_(to),
    subject: isFr ? `✅ Confirmez votre inscription — ${APP_NAME}` : `✅ Confirm your subscription — ${APP_NAME}`,
    html: baseTemplate(content, lang),
  });
  console.log("[Resend] Result:", JSON.stringify(result));
  return result;
}

// ─── 4. Envoi newsletter (admin) ─────────────────────────────

export async function sendNewsletter({ to, subject, htmlContent, lang = "fr" }) {
  const unsubscribeUrl = `${APP_URL}/newsletter/unsubscribe?email=${encodeURIComponent(to)}`;
  const isFr = lang === "fr";

  const content = `
    ${htmlContent}
    ${divider()}
    <p style="font-size:12px;color:#262335;opacity:0.4;text-align:center;">
      <a href="${unsubscribeUrl}" style="color:#463699;font-size:12px;">${
        isFr ? "Se désinscrire de la newsletter" : "Unsubscribe from newsletter"
      }</a>
    </p>`;

  return getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: baseTemplate(content, lang),
  });
}

// ─── 5. Batch newsletter (envoi à tous les abonnés) ──────────

export async function sendNewsletterBatch({ subscribers, subject, htmlContent }) {
  const results = await Promise.allSettled(
    subscribers.map((sub) =>
      sendNewsletter({
        to: sub.email,
        subject,
        htmlContent,
        lang: sub.lang || "fr",
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  return { sent, failed, total: subscribers.length };
}