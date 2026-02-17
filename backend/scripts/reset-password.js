// Reset a user's password by email (local/dev utility).
//
// Usage:
//   npm run reset-password -- --email alice@example.com --password newpass123
//
// Requires: MONGO_URI in backend/.env
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

const User = require('../models/User');

function readArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

async function main() {
  const email = readArg('email');
  const password = readArg('password');

  if (!email || !password) {
    console.error('Missing args. Example: npm run reset-password -- --email alice@example.com --password newpass123');
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User not found for email: ${email}`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  await user.save();

  console.log(`Password reset OK for ${email} (role: ${user.role})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

