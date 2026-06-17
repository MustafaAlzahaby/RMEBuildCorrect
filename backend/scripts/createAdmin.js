const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { env } = require("../src/config/env");
const User = require("../src/models/User");
const { isCompanyEmail, normalizeEmail } = require("../src/utils/normalizeEmail");

async function createAdmin() {
  const name = process.env.ADMIN_NAME;
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required.");
  }

  if (!isCompanyEmail(email)) {
    throw new Error("ADMIN_EMAIL must end with @rowad-rme.com.");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  await mongoose.connect(env.MONGODB_URI);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      passwordHash,
      role: "admin",
      isVerified: true,
      isActive: true,
    },
    { new: true, upsert: true, runValidators: true },
  );

  console.log(`Admin ready: ${user.email}`);
  await mongoose.disconnect();
}

createAdmin().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
