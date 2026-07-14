function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isCompanyEmail(email) {
  const normalized = normalizeEmail(email);
  const parts = normalized.split("@");
  return parts.length === 2 && parts[0].length > 0 && parts[1] === "rowad-rme.com";
}

module.exports = { isCompanyEmail, normalizeEmail };
