const mongoose = require("mongoose");
const { getMongoUri } = require("./env");

let eventsAttached = false;

const sanitizeUriForLogs = (uri) => {
  if (!uri) return "";
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
};

const attachConnectionEvents = () => {
  if (eventsAttached) return;

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  eventsAttached = true;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "Mongo URI is not set. Configure MONGODB_URI (preferred Atlas URI), MONGODB_ATLAS_URI, or DATABASE_URL.",
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  const pointsToLocalhost = /localhost|127\.0\.0\.1|::1/i.test(uri);

  if (isProduction && pointsToLocalhost) {
    throw new Error(
      "Production is using a localhost Mongo URI. Set MONGODB_URI to a hosted MongoDB connection string.",
    );
  }

  const maxRetries = Number(process.env.MONGODB_CONNECT_RETRIES || 5);
  const retryDelayMs = Number(process.env.MONGODB_RETRY_DELAY_MS || 3000);
  const maskedUri = sanitizeUriForLogs(uri);

  attachConnectionEvents();

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });

      const { host, name } = mongoose.connection;
      console.log(`MongoDB connected (${host}/${name})`);
      return;
    } catch (error) {
      const retryable = attempt < maxRetries;
      console.error(
        `MongoDB connect attempt ${attempt}/${maxRetries} failed for ${maskedUri}: ${error.message}`,
      );

      if (!retryable) {
        throw new Error(`MongoDB connection failed after ${maxRetries} attempts: ${error.message}`);
      }

      await wait(retryDelayMs);
    }
  }
};

module.exports = { connectDB };
