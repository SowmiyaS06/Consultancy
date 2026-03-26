const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Pincode = require("./models/Pincode");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

const pincodeData = [
  { code: "600001", isServiceable: true },
  { code: "600002", isServiceable: true },
  { code: "600004", isServiceable: true },
  { code: "600006", isServiceable: true },
  { code: "600008", isServiceable: true },
  { code: "600010", isServiceable: true },
  { code: "600014", isServiceable: true },
  { code: "600017", isServiceable: true },
  { code: "600018", isServiceable: true },
  { code: "600020", isServiceable: true },
  { code: "600024", isServiceable: true },
  { code: "600028", isServiceable: true },
  { code: "600034", isServiceable: true },
  { code: "600040", isServiceable: true },
  { code: "600041", isServiceable: true },
  { code: "600042", isServiceable: true },
  { code: "600044", isServiceable: true },
  { code: "600049", isServiceable: true },
  { code: "600078", isServiceable: true },
  { code: "600083", isServiceable: true },
  { code: "600087", isServiceable: true },
  { code: "600089", isServiceable: true },
  { code: "600091", isServiceable: true },
  { code: "600096", isServiceable: true },
  { code: "600097", isServiceable: false },
  { code: "600099", isServiceable: false },
  { code: "600100", isServiceable: false },
  { code: "600102", isServiceable: false },
  { code: "600116", isServiceable: true },
  { code: "600117", isServiceable: true },
];

const seedPincodes = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured in backend/.env");
  }

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    await Pincode.deleteMany({});
    const inserted = await Pincode.insertMany(pincodeData, { ordered: true });
    const serviceableCount = inserted.filter((item) => item.isServiceable).length;

    console.log(`Inserted ${inserted.length} pincodes`);
    console.log(`Serviceable: ${serviceableCount}, Non-serviceable: ${inserted.length - serviceableCount}`);
  } finally {
    await mongoose.disconnect();
  }
};

seedPincodes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed pincodes", error.message);
    process.exit(1);
  });