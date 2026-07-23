/**
 * LOCAL DEV ONLY — one-off manual seed.
 * Assigns each profile a random city from a fixed list of major Israeli cities.
 *
 * NOT wired to start / postinstall / Render / production.
 *
 * Usage (from backEnd/, against local Mongo only):
 *   node scripts/seed-random-cities.js --all
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');

/** Major cities only (CBS סמל ישוב) with coordinates. */
const MAJOR_CITIES = [
  { id: '3000', name: 'ירושלים', latitude: 31.7683, longitude: 35.2137 },
  { id: '5000', name: 'תל אביב - יפו', latitude: 32.0853, longitude: 34.7818 },
  { id: '4000', name: 'חיפה', latitude: 32.794, longitude: 34.9896 },
  { id: '9000', name: 'באר שבע', latitude: 31.2518, longitude: 34.7913 },
  { id: '7100', name: 'אשקלון', latitude: 31.6688, longitude: 34.5743 },
  { id: '70', name: 'אשדוד', latitude: 31.8044, longitude: 34.6553 },
  { id: '2600', name: 'אילת', latitude: 29.5577, longitude: 34.9519 },
  { id: '8000', name: 'צפת', latitude: 32.9646, longitude: 35.496 },
  { id: '7400', name: 'נתניה', latitude: 32.3215, longitude: 34.8532 },
  { id: '7900', name: 'פתח תקווה', latitude: 32.084, longitude: 34.8878 },
  { id: '8300', name: 'ראשון לציון', latitude: 31.9642, longitude: 34.8044 },
  { id: '6100', name: 'בני ברק', latitude: 32.0807, longitude: 34.8338 },
  { id: '6600', name: 'חולון', latitude: 32.0114, longitude: 34.7748 },
  { id: '6200', name: 'בת ים', latitude: 32.0171, longitude: 34.7455 },
  { id: '8600', name: 'רמת גן', latitude: 32.0823, longitude: 34.8107 },
  { id: '6400', name: 'הרצליה', latitude: 32.1624, longitude: 34.8447 },
  { id: '8700', name: 'רעננה', latitude: 32.1848, longitude: 34.8713 },
  { id: '8400', name: 'רחובות', latitude: 31.8928, longitude: 34.8113 },
  { id: '6700', name: 'טבריה', latitude: 32.7922, longitude: 35.5312 },
  { id: '7600', name: 'עכו', latitude: 32.9275, longitude: 35.0818 },
  { id: '2610', name: 'בית שמש', latitude: 31.7514, longitude: 34.9881 },
  { id: '3794', name: 'מודיעין-מכבים-רעות', latitude: 31.897, longitude: 35.0104 },
];

function assertLocalMongoUri(uri) {
  const normalized = uri.toLowerCase();
  const isLocal =
    normalized.includes('localhost') ||
    normalized.includes('127.0.0.1');

  if (!isLocal) {
    console.error(
      'Refusing to run: MONGODB_URI is not local.\n' +
        'This script is for local development only and will not touch production/Atlas.',
    );
    process.exit(1);
  }
}

function pickRandom(cities) {
  return cities[Math.floor(Math.random() * cities.length)];
}

async function main() {
  const forceAll = process.argv.includes('--all');
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) {
    throw new Error('MONGODB_URI is missing in backEnd/.env');
  }

  assertLocalMongoUri(uri);

  console.log('Connecting to local MongoDB...');
  await mongoose.connect(uri);

  const profiles = mongoose.connection.collection('profiles');
  const filter = forceAll
    ? {}
    : { $or: [{ city: { $exists: false } }, { city: null }, { city: '' }] };

  const docs = await profiles.find(filter).toArray();
  let updated = 0;

  for (const profile of docs) {
    const city = pickRandom(MAJOR_CITIES);
    await profiles.updateOne(
      { _id: profile._id },
      {
        $set: {
          city: city.id,
          cityLatitude: city.latitude,
          cityLongitude: city.longitude,
        },
      },
    );
    updated += 1;
    const label = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    console.log(`  ${label || profile.profileId || profile._id} → ${city.name}`);
  }

  console.log(`Done. Updated ${updated} local profiles.`);
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
