const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { getCorsOrigins, validateRuntimeEnv } = require("./config/env");
const { ensureAdminSeeded } = require("./seedAdmin");
const healthRoutes = require("./routes/health");
const productRoutes = require("./routes/productRoutes");
const storeRoutes = require("./routes/store");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const { errorHandler } = require("./middlewares/errorHandler");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
validateRuntimeEnv();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = getCorsOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (_req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api/health", healthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

connectDB()
  .then(async () => {
    await ensureAdminSeeded();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
