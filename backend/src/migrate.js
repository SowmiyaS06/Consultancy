const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const LOCAL_URI = process.env.LOCAL_MONGODB_URI;
const ATLAS_URI = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI || process.env.DATABASE_URL;
const MIGRATION_MODE = (process.env.MIGRATION_MODE || "upsert").toLowerCase();

const sanitizeUriForLogs = (uri) => {
  if (!uri) return "";
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
};

const isDuplicateKeyError = (error) => {
  if (!error) return false;
  if (error.code === 11000) return true;
  if (error.writeErrors && error.writeErrors.some((writeError) => writeError.code === 11000)) return true;
  return false;
};

const getCollections = async (connection) => {
  const collections = await connection.db.listCollections().toArray();
  return collections.map((collection) => collection.name).filter((name) => !name.startsWith("system."));
};

const migrateCollection = async ({ sourceConn, targetConn, collectionName, mode }) => {
  const sourceCollection = sourceConn.db.collection(collectionName);
  const targetCollection = targetConn.db.collection(collectionName);
  const docs = await sourceCollection.find({}).toArray();

  console.log(`Migrating collection: ${collectionName}`);
  console.log(`  Local documents: ${docs.length}`);

  if (docs.length === 0) {
    console.log("  Skipped: no documents to migrate");
    return { transferred: 0, skipped: true };
  }

  if (mode === "clear") {
    const cleared = await targetCollection.deleteMany({});
    console.log(`  Atlas cleared: ${cleared.deletedCount} documents`);
    await targetCollection.insertMany(docs, { ordered: false });
    console.log(`  Atlas inserted: ${docs.length} documents`);
    return { transferred: docs.length, skipped: false };
  }

  const operations = docs.map((doc) => ({
    replaceOne: {
      filter: { _id: doc._id },
      replacement: doc,
      upsert: true,
    },
  }));

  const result = await targetCollection.bulkWrite(operations, { ordered: false });
  const transferred = (result.upsertedCount || 0) + (result.modifiedCount || 0) + (result.matchedCount || 0);
  console.log(
    `  Atlas upsert summary: matched=${result.matchedCount}, modified=${result.modifiedCount}, upserted=${result.upsertedCount}`,
  );

  return { transferred, skipped: false };
};

const migrate = async () => {
  if (!LOCAL_URI) {
    throw new Error("LOCAL_MONGODB_URI is required in backend/.env");
  }

  if (!ATLAS_URI) {
    throw new Error("MONGODB_URI (or MONGODB_ATLAS_URI / DATABASE_URL) is required in backend/.env");
  }

  if (!["upsert", "clear"].includes(MIGRATION_MODE)) {
    throw new Error("MIGRATION_MODE must be either 'upsert' or 'clear'");
  }

  console.log("Starting MongoDB migration...");
  console.log(`Source: ${sanitizeUriForLogs(LOCAL_URI)}`);
  console.log(`Target: ${sanitizeUriForLogs(ATLAS_URI)}`);
  console.log(`Mode: ${MIGRATION_MODE}`);

  const sourceConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  const targetConn = await mongoose.createConnection(ATLAS_URI).asPromise();

  try {
    const sourceCollections = await getCollections(sourceConn);

    if (sourceCollections.length === 0) {
      console.log("No collections found in local database.");
      return;
    }

    let totalTransferred = 0;

    for (const collectionName of sourceCollections) {
      try {
        const { transferred } = await migrateCollection({
          sourceConn,
          targetConn,
          collectionName,
          mode: MIGRATION_MODE,
        });
        totalTransferred += transferred;
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          console.warn(`  Duplicate key issue in ${collectionName}: ${error.message}`);
          continue;
        }

        throw error;
      }
    }

    console.log(`Migration completed. Total documents processed: ${totalTransferred}`);
  } finally {
    await sourceConn.close();
    await targetConn.close();
  }
};

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exit(1);
  });