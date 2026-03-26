const env = require("../config/env");
const { verifyMailConnection, sendBookPublishedEmail } = require("../services/mailer");

// lee argumentos simples
function readArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : "";
}

async function run() {
  try {
    const to = readArg("to") || env.mail.testTo;

    if (!to) {
      console.error("falta destino: usa --to=correo@dominio.com o MAIL_TEST_TO en .env");
      process.exit(1);
    }

    const verify = await verifyMailConnection();
    console.log(`modo de correo: ${verify.mode}`);

    const result = await sendBookPublishedEmail({
      authorEmail: to,
      authorName: "autor demo",
      bookTitle: "libro de prueba"
    });

    console.log("resultado:", JSON.stringify(result));
  } catch (error) {
    console.error("fallo prueba de correo:", error.message);
    process.exit(1);
  }
}

run();
