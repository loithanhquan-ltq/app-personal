#!/usr/bin/env node
// Usage: node scripts/send-special-day.mjs --event [test|birthday|anniversary]
// Env:   GMAIL_USER  — your Gmail address (loithanhquan@gmail.com)
//        GMAIL_PASS  — Gmail App Password (16-char, from myaccount.google.com → Security → App passwords)
//        HER_EMAIL   — recipient (default: hokhoamaiquynh12@gmail.com)
// test

import nodemailer from "../web/node_modules/nodemailer/lib/nodemailer.js";

const GMAIL_USER = process.env.GMAIL_USER || "loithanhquan@gmail.com";
const GMAIL_PASS = process.env.GMAIL_PASS;
const HER_EMAIL  = process.env.HER_EMAIL  || "hokhoamaiquynh12@gmail.com";
const SENDER_NAME = "Quan";
const APP_URL = "https://memories.loiquan.dev";

const ANNIVERSARY_START_YEAR = 2022;

function yearsTogether() {
  return new Date().getFullYear() - ANNIVERSARY_START_YEAR;
}

function emailCard(eyebrow, body, closing) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5ede0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5ede0;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fdf8f0;border:1px solid #e0d5c5;border-radius:4px;padding:44px 44px 48px;" cellpadding="0" cellspacing="0">
        <tr><td>
          <p style="margin:0 0 28px;color:#a44a2a;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;font-family:Georgia,serif;">${eyebrow}</p>
          <p style="margin:0 0 20px;color:#2c2217;font-size:18px;line-height:1.8;font-family:Georgia,serif;">Ma chérie,</p>
          ${body}
          <p style="margin:0 0 6px;color:#2c2217;font-size:17px;line-height:1.9;font-family:Georgia,serif;">${closing}</p>
          <p style="margin:0 0 44px;color:#2c2217;font-size:17px;font-family:Georgia,serif;">${SENDER_NAME}</p>
          <hr style="border:none;border-top:1px solid #e0d5c5;margin:0 0 24px;">
          <a href="${APP_URL}" style="color:#a44a2a;font-size:12px;text-decoration:none;letter-spacing:1px;font-family:Georgia,serif;">Nos souvenirs →</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const p = (text) =>
  `<p style="margin:0 0 18px;color:#2c2217;font-size:17px;line-height:1.9;font-family:Georgia,serif;">${text}</p>`;

const EMAILS = {
  test: {
    subject: "Aujourd'hui est un beau jour 🌸",
    html: emailCard(
      "Pour toi",
      p("Aujourd'hui n'est pas un jour particulier —<br>et pourtant, je pense à toi.") +
      p("Parce que chaque jour avec toi est, à sa façon, un beau jour."),
      "Je t'aime, tout simplement."
    ),
  },

  birthday: {
    subject: "Joyeux anniversaire, Mai Quynh 🎂",
    html: emailCard(
      "Joyeux anniversaire",
      p("Aujourd'hui, c'est ton jour — le jour où tu es arrivée dans ce monde,<br>et un peu plus tard, dans ma vie.") +
      p("Je ne sais pas toujours trouver les mots justes, mais je sais ceci :<br>chaque jour passé avec toi est un cadeau que je chérirai toujours.") +
      p("Tu es ma lumière, mon refuge, ma personne préférée.") +
      p("Joyeux anniversaire, mon amour. 🎂"),
      "Avec tout mon amour,"
    ),
  },

  anniversary: {
    subject: `${yearsTogether()} ans ensemble, mon amour 💕`,
    html: emailCard(
      `${yearsTogether()} ans`,
      p(`Il y a ${yearsTogether()} ans aujourd'hui, quelque chose de merveilleux a commencé.<br>Toi et moi.`) +
      p("Je ne saurais pas imaginer ma vie sans toi. Chaque souvenir que nous<br>avons créé ensemble est gravé dans mon cœur — et dans nos mémoires.") +
      p("À toi, à nous, et à toutes les années qui nous attendent encore. 🥂"),
      "Je t'aime,"
    ),
  },
};

async function main() {
  const idx = process.argv.indexOf("--event");
  const eventArg = idx !== -1 ? process.argv[idx + 1] : undefined;

  if (!eventArg || !EMAILS[eventArg]) {
    console.error("Usage: node scripts/send-special-day.mjs --event [test|birthday|anniversary]");
    process.exit(1);
  }

  if (!GMAIL_PASS) {
    console.error("Missing GMAIL_PASS environment variable.");
    console.error("Get an App Password at: myaccount.google.com → Security → App passwords");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });

  const { subject, html } = EMAILS[eventArg];
  console.log(`Sending "${eventArg}" email to ${HER_EMAIL}…`);

  const info = await transporter.sendMail({
    from: `"${SENDER_NAME}" <${GMAIL_USER}>`,
    to: HER_EMAIL,
    subject,
    html,
  });

  console.log("Sent! Message ID:", info.messageId);
}

main().catch((err) => { console.error("Failed:", err.message); process.exit(1); });
