const app = require("./app");
const { connectDB } = require("./config/db");
const { ensureAdminSeeded } = require("./seedAdmin");

const PORT = process.env.PORT || 5000;

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
