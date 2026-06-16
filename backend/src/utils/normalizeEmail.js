function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isCompanyEmail(email) {
  return normalizeEmail(email).endsWith("@rowad-rme.com");
}

module.exports = { isCompanyEmail, normalizeEmail };
