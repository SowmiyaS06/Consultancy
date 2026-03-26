const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || "mongodb://localhost:27017/vel-super-market";
const ATLAS_URI = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI || process.env.DATABASE_URL;

const sanitizeUriForLogs = (uri) => {
  if (!uri) return "";
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
};

const migrate = async () => {
  if (!ATLAS_URI) {
    throw new Error("Target Atlas URI missing. Set MONGODB_URI in backend/.env");
  }

  const sourceConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  const targetConn = await mongoose.createConnection(ATLAS_URI).asPromise();

  try {
    const collections = await sourceConn.db.listCollections().toArray();
    const userCollections = collections
      .map((c) => c.name)
      .filter((name) => !name.startsWith("system."));

    if (userCollections.length === 0) {
      console.log("No collections found in local database.");
      return;
    }

    console.log(`Source: ${sanitizeUriForLogs(LOCAL_URI)}`);
    console.log(`Target: ${sanitizeUriForLogs(ATLAS_URI)}`);

    for (const collectionName of userCollections) {
      const sourceCollection = sourceConn.db.collection(collectionName);
      const targetCollection = targetConn.db.collection(collectionName);
      const docs = await sourceCollection.find({}).toArray();

      if (docs.length === 0) {
        console.log(`Skipped ${collectionName}: 0 docs`);
        continue;
      }

      const ops = docs.map((doc) => ({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: doc },
          upsert: true,
        },
      }));

      await targetCollection.bulkWrite(ops, { ordered: false });
      console.log(`Migrated ${collectionName}: ${docs.length} docs`);
    }

    console.log("Local to Atlas migration completed.");
  } finally {
    await sourceConn.close();
    await targetConn.close();
  }
};

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  });
