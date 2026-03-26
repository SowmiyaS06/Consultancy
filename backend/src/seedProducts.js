const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("./models/Product");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

const sanitizeUriForLogs = (uri) => {
  if (!uri) return "";
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
};

const categoryTemplates = [
  {
    category: "Daily Essentials",
    items: [
      "Toor Dal Premium",
      "Idli Rice",
      "Groundnut Oil",
      "Iodized Salt",
      "Sugar Fine",
      "Wheat Flour Atta",
      "Turmeric Powder",
      "Red Chilli Powder",
      "Coriander Powder",
      "Tamarind Block",
      "Cumin Seeds",
      "Mustard Seeds",
      "Urad Dal Split",
    ],
  },
  {
    category: "Snacks & Treats",
    items: [
      "Potato Chips Classic",
      "Banana Chips Salted",
      "Masala Murukku",
      "Mixture Spicy",
      "Salted Peanuts",
      "Chocolate Wafer Rolls",
      "Butter Cookies Tin",
      "Roasted Makhana",
      "Caramel Popcorn",
      "Kara Boondi",
      "Ribbon Pakoda",
      "Jaggery Peanut Chikki",
      "Dry Fruit Laddu Box",
    ],
  },
  {
    category: "Personal & Home Care",
    items: [
      "Bath Soap Pack",
      "Hand Wash Refill",
      "Toothpaste Gel",
      "Shampoo Smooth Care",
      "Floor Cleaner Citrus",
      "Dishwash Gel",
      "Toilet Cleaner Active",
      "Surface Disinfectant Spray",
      "Liquid Detergent",
      "Fabric Conditioner",
      "Garbage Bags Large",
      "Air Freshener Lavender",
      "Scrub Sponge Pack",
    ],
  },
  {
    category: "School & Kids",
    items: [
      "Lunch Box Steel",
      "Water Bottle 750ml",
      "Kids Choco Drink Mix",
      "Color Pencils Set",
      "Sketch Pen Set",
      "School Labels Pack",
      "Crayons Jumbo",
      "Glue Stick",
      "Craft Paper Bundle",
      "Kids Toothbrush Soft",
      "Kids Shampoo Mild",
      "Fruit Jam Mixed",
      "Peanut Butter Crunchy",
    ],
  },
  {
    category: "Kitchen Needs",
    items: [
      "Aluminium Foil Roll",
      "Cling Wrap Roll",
      "Storage Container Set",
      "Garlic Paste",
      "Ginger Paste",
      "Sambar Powder",
      "Rasam Powder",
      "Pepper Whole",
      "Fenugreek Seeds",
      "Curry Leaves Dried",
      "Basmati Rice",
      "Poha Thick",
      "Semolina Rava",
    ],
  },
  {
    category: "Fresh Items",
    items: [
      "Tomato Hybrid",
      "Onion Small",
      "Potato Fresh",
      "Carrot Orange",
      "Beans French",
      "Cabbage Green",
      "Banana Robusta",
      "Apple Royal Gala",
      "Orange Nagpur",
      "Pomegranate Premium",
      "Coriander Leaves",
      "Mint Leaves",
      "Coconut Whole",
    ],
  },
  {
    category: "Grocery Staples",
    items: [
      "Chana Dal",
      "Moong Dal",
      "Rajma Red",
      "Kabuli Chana",
      "Black Pepper Powder",
      "Cardamom Whole",
      "Cloves Whole",
      "Bay Leaves",
      "Rock Salt",
      "Vermicelli Roasted",
      "Jaggery Powder",
      "Corn Flour",
      "Besan Flour",
    ],
  },
  {
    category: "Snacks & Biscuits",
    items: [
      "Marie Gold Biscuits",
      "Cream Biscuits Vanilla",
      "Digestive Biscuits",
      "Jeera Crackers",
      "Salt Biscuits",
      "Chocolate Cookies",
      "Oats Cookies",
      "Rusk Toast",
      "Khari Puff",
      "Mini Samosa Pack",
      "Baked Nachos",
      "Multigrain Crackers",
      "Cheese Wafers",
    ],
  },
  {
    category: "Dairy & Bakery",
    items: [
      "Full Cream Milk 1L",
      "Curd Cup",
      "Paneer Fresh",
      "Butter Unsalted",
      "Cheese Slices",
      "Bread Brown",
      "Bread White",
      "Whole Wheat Bun",
      "Eggless Cake Vanilla",
      "Muffin Chocolate",
      "Greek Yogurt",
      "Buttermilk Spiced",
      "Fresh Cream",
    ],
  },
  {
    category: "Beverages",
    items: [
      "Tea Dust Premium",
      "Instant Coffee",
      "Green Tea Bags",
      "Lemon Juice Concentrate",
      "Mango Juice",
      "Mixed Fruit Juice",
      "Tender Coconut Water",
      "Rose Milk Syrup",
      "Malted Health Drink",
      "Soda Water",
      "Energy Drink Can",
      "Sparkling Water",
      "Badam Drink",
    ],
  },
  {
    category: "Personal Care",
    items: [
      "Face Wash Neem",
      "Moisturizing Cream",
      "Body Lotion Cocoa",
      "Hair Oil Coconut",
      "Conditioner Smooth",
      "Deodorant Roll On",
      "Shaving Cream",
      "Razor Blades Pack",
      "Lip Balm",
      "Sunscreen SPF 50",
      "Talc Powder",
      "Cotton Buds",
      "Wet Wipes",
    ],
  },
  {
    category: "Home Care / Cleaning",
    items: [
      "Washing Powder",
      "Detergent Bar",
      "Glass Cleaner",
      "Bathroom Cleaner",
      "Kitchen Cleaner",
      "Bleach Liquid",
      "Phenyl Disinfectant",
      "Mop Refill",
      "Broom Soft",
      "Dust Pan Set",
      "Microfiber Cloth Pack",
      "Drain Cleaner",
      "Insect Repellent Spray",
    ],
  },
  {
    category: "Baby Care",
    items: [
      "Baby Diapers Medium",
      "Baby Wipes Aloe",
      "Baby Lotion",
      "Baby Soap Mild",
      "Baby Shampoo",
      "Baby Powder",
      "Baby Oil",
      "Feeding Bottle",
      "Baby Cereal Rice",
      "Baby Rattle Toy",
      "Baby Laundry Liquid",
      "Baby Bib Set",
      "Nappy Rash Cream",
    ],
  },
  {
    category: "Health & Wellness",
    items: [
      "Multivitamin Tablets",
      "Vitamin C Tablets",
      "Protein Powder",
      "Glucose Powder",
      "Pain Relief Balm",
      "Digital Thermometer",
      "Band Aid Strips",
      "Hand Sanitizer",
      "Ayurvedic Chyawanprash",
      "Herbal Immunity Drink",
      "ORS Sachets",
      "Antiseptic Liquid",
      "Steam Inhaler",
    ],
  },
  {
    category: "Stationery & Misc",
    items: [
      "Notebook A4",
      "Ball Pen Blue",
      "Pencil HB Pack",
      "Eraser Soft",
      "Sharpener Metal",
      "Scale 30cm",
      "Stapler Mini",
      "Sticky Notes",
      "Marker Pen Black",
      "Calculator Basic",
      "Cello Tape Roll",
      "Brown Cover Sheets",
      "File Folder",
    ],
  },
  {
    category: "Pet Care",
    items: [
      "Dog Food Adult",
      "Cat Food Tuna",
      "Puppy Food Starter",
      "Pet Shampoo",
      "Pet Soap",
      "Dog Biscuits",
      "Cat Litter",
      "Pet Bowl Steel",
      "Pet Leash Nylon",
      "Flea Control Powder",
      "Pet Tick Spray",
      "Pet Wipes",
      "Pet Chew Sticks",
    ],
  },
];

const buildImageUrl = (name, category) => {
  const query = encodeURIComponent(`${name} ${category} product packshot`);
  return `https://source.unsplash.com/800x800/?${query}`;
};

const basePrices = {
  "Daily Essentials": 35,
  "Snacks & Treats": 30,
  "Personal & Home Care": 60,
  "School & Kids": 55,
  "Kitchen Needs": 45,
  "Fresh Items": 25,
  "Grocery Staples": 40,
  "Snacks & Biscuits": 20,
  "Dairy & Bakery": 28,
  Beverages: 30,
  "Personal Care": 70,
  "Home Care / Cleaning": 65,
  "Baby Care": 80,
  "Health & Wellness": 90,
  "Stationery & Misc": 18,
  "Pet Care": 75,
};

const productData = categoryTemplates.flatMap(({ category, items }) => {
  const base = basePrices[category] || 40;
  return items.map((name, index) => {
    const price = Number((base + index * 7 + (index % 3) * 5).toFixed(2));
    const stock = 20 + ((index * 9) % 80);

    return {
      name,
      price,
      category,
      stock,
      image: buildImageUrl(name, category),
      inStock: stock > 0,
      isActive: true,
    };
  });
});

const seedProducts = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in backend/.env");
  }

  console.log(`Connecting to MongoDB: ${sanitizeUriForLogs(MONGODB_URI)}`);
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB Atlas");

  try {
    const existingCount = await Product.countDocuments();
    console.log(`Existing products in DB: ${existingCount}`);

    const deleteResult = await Product.deleteMany({});
    console.log(`Cleared existing products: ${deleteResult.deletedCount}`);

    const insertResult = await Product.insertMany(productData, { ordered: false });
    console.log(`Inserted products: ${insertResult.length}`);

    const totalByCategory = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log("Category-wise product count:");
    totalByCategory.forEach((entry) => {
      console.log(`- ${entry._id}: ${entry.count}`);
    });
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedProducts()
  .then(() => {
    console.log(`Seeding completed successfully. Total products prepared: ${productData.length}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  });
