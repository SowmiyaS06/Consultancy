const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, "");

const splitCsv = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getCorsOrigins = () => {
  const origins = splitCsv(process.env.CORS_ORIGIN).map(normalizeOrigin);
  if (origins.length > 0) {
    return origins;
  }

  if (process.env.NODE_ENV !== "production") {
    return ["http://localhost:5173", "http://127.0.0.1:5173"];
  }

  return [];
};

const requireEnv = (key, options = {}) => {
  const { optionalInDevelopment = false } = options;
  const value = process.env[key];

  if (value) {
    return value;
  }

  if (optionalInDevelopment && process.env.NODE_ENV !== "production") {
    return "";
  }

  throw new Error(`Missing required environment variable: ${key}`);
};

const getJwtSecret = () => requireEnv("JWT_SECRET");

const getMongoUri = () =>
  process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI || process.env.DATABASE_URL || "";

const validateRuntimeEnv = () => {
  requireEnv("JWT_SECRET");

  if (!getMongoUri()) {
    throw new Error(
      "Mongo URI is not set. Configure MONGODB_URI (preferred), MONGODB_ATLAS_URI, or DATABASE_URL.",
    );
  }
};

module.exports = {
  getCorsOrigins,
  getJwtSecret,
  getMongoUri,
  validateRuntimeEnv,
};
