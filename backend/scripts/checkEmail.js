const { verifyEmailTransport } = require("../src/services/emailService");

verifyEmailTransport()
  .then(() => {
    console.log("SMTP connection and credentials are valid.");
  })
  .catch((error) => {
    console.error("SMTP check failed:", error.message);
    process.exit(1);
  });
