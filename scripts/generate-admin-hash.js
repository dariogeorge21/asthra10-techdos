const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123'; // Default admin password
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nUpdate your migration file with this hash:');
  console.log(`INSERT INTO admin_users (username, password_hash) VALUES ('admin', '${hash}');`);
}

generateHash().catch(console.error);
