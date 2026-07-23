/**
 * LOCAL DEV ONLY — create/update an admin account.
 * Usage: node scripts/create-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

const EMAIL = 'Admin@gmail.com';
const PASSWORD = 'Admin@';
const FIRST_NAME = 'admin';

function assertLocalMongoUri(uri) {
  const normalized = uri.toLowerCase();
  if (!normalized.includes('localhost') && !normalized.includes('127.0.0.1')) {
    console.error('Refusing to run: MONGODB_URI is not local.');
    process.exit(1);
  }
}

async function main() {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) throw new Error('MONGODB_URI is missing');
  assertLocalMongoUri(uri);

  await mongoose.connect(uri);
  const accounts = mongoose.connection.collection('accounts');
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const existing = await accounts.findOne({ email: EMAIL });

  if (existing) {
    await accounts.updateOne(
      { email: EMAIL },
      {
        $set: {
          role: 'admin',
          firstName: FIRST_NAME,
          lastName: '',
          passwordHash,
          isBlocked: false,
          isDeleted: false,
          deletedAt: null,
        },
      },
    );
    console.log(`Updated existing account to admin: ${EMAIL}`);
  } else {
    const accountId = randomUUID();
    await accounts.insertOne({
      accountId,
      email: EMAIL,
      passwordHash,
      role: 'admin',
      firstName: FIRST_NAME,
      lastName: '',
      profileId: null,
      phone: null,
      settings: {},
      linkedShadchanIds: [],
      isBlocked: false,
      isDeleted: false,
      deletedAt: null,
    });
    console.log(`Created admin account: ${EMAIL} (${accountId})`);
  }

  const check = await accounts.findOne(
    { email: EMAIL },
    { projection: { email: 1, role: 1, firstName: 1, accountId: 1 } },
  );
  console.log(check);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
