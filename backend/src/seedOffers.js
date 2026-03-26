const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Offer = require("./models/Offer");
const Product = require("./models/Product");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

const offerTemplates = [
  { title: "Weekly Grocery Saver", bannerUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80" },
  { title: "Fresh Picks Festival", bannerUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80" },
  { title: "Snacks Bonanza", bannerUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=1200&q=80" },
  { title: "Dairy and Bakery Delight", bannerUrl: "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=1200&q=80" },
  { title: "Home Care Essentials Deal", bannerUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80" },
  { title: "Health and Wellness Picks", bannerUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80" },
  { title: "Beverage Mega Offer", bannerUrl: "https://images.unsplash.com/photo-1543253539-4b6d2f73a3e9?auto=format&fit=crop&w=1200&q=80" },
  { title: "Baby Care Comfort Pack", bannerUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80" },
];

const pickProducts = (products, startIndex, count) => {
  const selected = [];
  for (let i = 0; i < count; i += 1) {
    selected.push(products[(startIndex + i) % products.length]._id);
  }
  return selected;
};

const seedOffers = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured in backend/.env");
  }

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: 1 }).limit(50);
    if (products.length < 10) {
      throw new Error("Need at least 10 active products before seeding offers. Run npm run seed first.");
    }

    await Offer.deleteMany({});

    const offersToInsert = offerTemplates.map((template, index) => ({
      title: template.title,
      bannerUrl: template.bannerUrl,
      isActive: true,
      products: pickProducts(products, index * 4, 6),
    }));

    const inserted = await Offer.insertMany(offersToInsert, { ordered: true });
    console.log(`Inserted ${inserted.length} offers`);
  } finally {
    await mongoose.disconnect();
  }
};

seedOffers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed offers", error.message);
    process.exit(1);
  });
