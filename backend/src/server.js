const path = require("path");
const dotenv = require("dotenv");
const app = require("./app");
const { connectDB } = require("./config/db");
const { validateRuntimeEnv } = require("./config/env");
const { ensureAdminSeeded } = require("./seedAdmin");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const PORT = process.env.PORT || 5000;
validateRuntimeEnv();

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
