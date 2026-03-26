const nodemailer = require("nodemailer");
const env = require("../config/env");

// valida si hay config smtp completa
function hasSmtpConfig() {
  return Boolean(env.mail.host && env.mail.port && env.mail.from);
}

// decide si usa modo simulado
function shouldUseMockMode() {
  if (env.mail.mode === "mock") return true;
  if (env.mail.mode === "smtp") return false;
  return !hasSmtpConfig();
}

// crea transporte real o simulado
function buildTransporter() {
  if (shouldUseMockMode()) {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth:
      env.mail.user && env.mail.pass
        ? {
            user: env.mail.user,
            pass: env.mail.pass
          }
        : undefined
  });
}

const transporter = buildTransporter();

function getMailMode() {
  return shouldUseMockMode() ? "mock" : "smtp";
}

// verifica conexion smtp si aplica
async function verifyMailConnection() {
  if (getMailMode() === "mock") {
    return { verified: true, mode: "mock" };
  }

  await transporter.verify();
  return { verified: true, mode: "smtp" };
}

// envia correo al autor cuando se crea libro
async function sendBookPublishedEmail({ authorEmail, authorName, bookTitle }) {
  if (!authorEmail) {
    return { sent: false, reason: "author_without_email", mode: getMailMode() };
  }

  const info = await transporter.sendMail({
    from: env.mail.from,
    to: authorEmail,
    subject: "nuevo libro publicado",
    text: `hola ${authorName || "autor"}, se publico un libro de tu autoria: ${bookTitle}.`
  });

  if (getMailMode() === "mock") {
    console.log("correo simulado:", info.message);
  }

  return {
    sent: true,
    mode: getMailMode(),
    messageId: info.messageId || "simulated"
  };
}

module.exports = {
  getMailMode,
  verifyMailConnection,
  sendBookPublishedEmail
};
