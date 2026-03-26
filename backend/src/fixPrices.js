const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("./models/Product");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

const toInt = (value) => Math.round(value);
const randomBetween = (min, max) => toInt(Math.random() * (max - min) + min);

const categoryAliases = {
  "daily essentials": ["daily essentials", "daily-essentials", "grocery staples", "grocery-staples"],
  "snacks treats": ["snacks & treats", "snacks-treats"],
  "dairy bakery": ["dairy & bakery", "dairy-bakery"],
  beverages: ["beverages"],
  "personal care": ["personal care", "personal-care", "personal & home care", "personal-home"],
  "baby care": ["baby care", "baby-care"],
  "kitchen needs": ["kitchen needs", "kitchen-needs", "kitchen essentials", "kitchen-essentials"],
  "fresh items": ["fresh items", "fresh-items"],
};

const matchesCategory = (category, key) => {
  const normalized = (category || "").toLowerCase().trim();
  return (categoryAliases[key] || []).some((alias) => normalized === alias);
};

const pickPriceRange = (product) => {
  const name = (product.name || "").toLowerCase();
  const category = product.category || "";

  if (matchesCategory(category, "daily essentials")) {
    if (/rice/.test(name)) return [50, 80];
    if (/oil|ghee/.test(name)) return [120, 180];
    if (/sugar|jaggery/.test(name)) return [40, 60];
    return [45, 130];
  }

  if (matchesCategory(category, "snacks treats")) {
    if (/biscuit|cookie|cracker|rusk/.test(name)) return [10, 40];
    if (/chips|nachos|wafers|murukku|mixture|popcorn/.test(name)) return [20, 50];
    if (/chocolate|cocoa|candy/.test(name)) return [20, 100];
    return [15, 90];
  }

  if (matchesCategory(category, "dairy bakery")) {
    if (/milk|curd|yogurt|buttermilk/.test(name)) return [50, 70];
    if (/bread|bun|cake|muffin/.test(name)) return [30, 50];
    if (/butter|cheese|paneer/.test(name)) return [50, 120];
    return [35, 110];
  }

  if (matchesCategory(category, "beverages")) {
    if (/tea|coffee/.test(name)) return [100, 400];
    if (/soft|drink|juice|soda|water|energy/.test(name)) return [20, 100];
    return [30, 180];
  }

  if (matchesCategory(category, "personal care")) {
    if (/soap|face wash|body wash/.test(name)) return [30, 80];
    if (/shampoo|conditioner/.test(name)) return [80, 300];
    return [40, 220];
  }

  if (matchesCategory(category, "baby care")) {
    return [100, 500];
  }

  if (matchesCategory(category, "kitchen needs")) {
    if (/container|set|knife|pan|pot|utensil|bottle|lunch box/.test(name)) return [200, 1500];
    return [120, 650];
  }

  if (matchesCategory(category, "fresh items")) {
    return [20, 80];
  }

  // Fallback for categories not listed in this pricing update request.
  return [30, 250];
};

const buildUpdatedPrice = (product) => {
  const [min, max] = pickPriceRange(product);
  const price = randomBetween(min, max);

  if (product.isOffer) {
    const markup = Math.random() * 0.3 + 0.1;
    const originalPrice = toInt(price * (1 + markup));
    return { price, originalPrice };
  }

  return { price, originalPrice: undefined };
};

const run = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured in backend/.env");
  }

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    const products = await Product.find({});

    if (products.length === 0) {
      console.log("No products found to update.");
      return;
    }

    const ops = products.map((product) => {
      const { price, originalPrice } = buildUpdatedPrice(product);
      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              price,
              ...(typeof originalPrice === "number" ? { originalPrice } : {}),
            },
            ...(typeof originalPrice !== "number" ? { $unset: { originalPrice: "" } } : {}),
          },
        },
      };
    });

    const result = await Product.bulkWrite(ops, { ordered: false });
    const updatedCount = (result.modifiedCount || 0) + (result.upsertedCount || 0);

    console.log(`Updated prices for ${updatedCount} products`);
  } finally {
    await mongoose.disconnect();
  }
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to update product prices", error.message);
    process.exit(1);
  });
