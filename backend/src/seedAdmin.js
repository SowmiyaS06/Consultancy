const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const ensureAdminSeeded = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set. Admin seed skipped.");
    return;
  }

  const existing = await Admin.findOne({ email: adminEmail });
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  if (existing) {
    const matches = await bcrypt.compare(adminPassword, existing.password);
    if (!matches) {
      existing.password = hashedPassword;
      existing.name = existing.name || "VEL Super Market Admin";
      existing.role = "admin";
      await existing.save();
    }
    return;
  }

  await Admin.create({
    name: "VEL Super Market Admin",
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
  });
};

module.exports = { ensureAdminSeeded };
