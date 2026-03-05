const fs = require("fs");
const path = require("path");
const vm = require("vm");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const Product = require("./models/Product");
const { getDynamicProductImage } = require("./utils/productImage");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const getProductsFromFrontend = () => {
  const dataPath = path.resolve(__dirname, "..", "..", "src", "data", "products.ts");
  console.log(`Reading products from: ${dataPath}`);
  const content = fs.readFileSync(dataPath, "utf8");
  console.log(`Products file chars: ${content.length}`);

  const exportIndex = content.indexOf("export const products");
  if (exportIndex === -1) {
    throw new Error("Products export not found");
  }

  const equalsIndex = content.indexOf("=", exportIndex);
  if (equalsIndex === -1) {
    throw new Error("Products export assignment not found");
  }

  const arrayStart = content.indexOf("[", equalsIndex);
  if (arrayStart === -1) {
    throw new Error("Products array start not found");
  }

  let depth = 0;
  let arrayEnd = -1;
  for (let i = arrayStart; i < content.length; i += 1) {
    const char = content[i];
    if (char === "[") depth += 1;
    if (char === "]") depth -= 1;
    if (depth === 0) {
      arrayEnd = i;
      break;
    }
  }

  if (arrayEnd === -1) {
    throw new Error("Products array end not found");
  }

  const arrayLiteral = content.slice(arrayStart, arrayEnd + 1);
  console.log(`Parsed products array chars: ${arrayLiteral.length}`);
  const sandbox = { module: { exports: null } };
  vm.runInNewContext(`module.exports = ${arrayLiteral};`, sandbox);
  if (!Array.isArray(sandbox.module.exports)) {
    console.log("Parsed products export is not an array.");
  }
  console.log(`Parsed products count: ${Array.isArray(sandbox.module.exports) ? sandbox.module.exports.length : 0}`);
  return sandbox.module.exports;
};

const normalizeProduct = (product) => ({
  name: product.name,
  price: product.price,
  originalPrice: product.originalPrice,
  category: product.category,
  image: getDynamicProductImage(product.name, product.image),
  brand: product.brand,
  unit: product.unit,
  stock: typeof product.stock === "number" ? product.stock : 0,
  inStock: typeof product.inStock === "boolean" ? product.inStock : (product.stock || 0) > 0,
  isOffer: Boolean(product.isOffer),
  isActive: true,
});

const seedProducts = async () => {
  const products = getProductsFromFrontend().map(normalizeProduct);

  if (!products.length) {
    console.log("No products found to seed.");
    return;
  }

  const operations = products.map((product) => ({
    updateOne: {
      filter: { name: product.name, category: product.category },
      update: { $set: product },
      upsert: true,
    },
  }));

  const result = await Product.bulkWrite(operations);
  console.log(`Products upserted: ${result.upsertedCount}, modified: ${result.modifiedCount}`);
};

connectDB()
  .then(async () => {
    await seedProducts();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed products", err);
    process.exit(1);
  });
