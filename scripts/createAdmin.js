require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('../services/mysql.service');

async function createAdmin() {
  const { ADMIN_FIRST_NAMES, ADMIN_LAST_NAMES, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_FIRST_NAMES || !ADMIN_LAST_NAMES || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error('Set ADMIN_FIRST_NAMES, ADMIN_LAST_NAMES, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters.');
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await pool.execute(
    `INSERT INTO users
       (user_first_names, user_last_names, user_email, user_password_hash, user_role)
     VALUES (?, ?, ?, ?, '1')`,
    [ADMIN_FIRST_NAMES.trim(), ADMIN_LAST_NAMES.trim(), ADMIN_EMAIL.trim().toLowerCase(), passwordHash]
  );
  console.log('Admin account created.');
}

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());