const fs = require("fs");
const path = require("path");

const productsFile = path.join(__dirname, "..", "src", "data", "products.ts");
const publicDir = path.join(__dirname, "..", "public");

const CATEGORY_IMAGE_FOLDER = {
  "grocery-staples": "grocery",
  "snacks-biscuits": "snacks",
  "dairy-bakery": "dairy",
  beverages: "beverages",
  "personal-care": "personal-care",
  "home-care": "home-care",
  "kitchen-essentials": "kitchen",
  "baby-care": "baby-care",
  "health-wellness": "health",
  stationery: "stationery",
  "pet-care": "pet-care",
};

const DEFAULT_PACKSIZE = {
  kg: "1kg",
  g: "500g",
  ltr: "1ltr",
  ml: "500ml",
  pcs: "1pcs",
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

const buildImagePath = ({ category, brand, name, unit, image }) => {
  if (image && !image.includes("/product.jpg") && !image.includes("/placeholder")) {
    return image;
  }

  const folder = CATEGORY_IMAGE_FOLDER[category];
  const brandSlug = slugify(brand || "brand");
  const nameSlug = slugify(name);
  const pack = DEFAULT_PACKSIZE[unit] || "1pcs";

  return `/images/${folder}/${brandSlug}-${nameSlug}-${pack}.jpg`;
};

const content = fs.readFileSync(productsFile, "utf8");
const productBlocks = Array.from(
  content.matchAll(/\{\s*id:\s*"(\d+)"[\s\S]*?\n\s*\}/g)
).map((match) => match[0]);

const getField = (block, field) => {
  const match = block.match(new RegExp(`${field}:\\s*\\"([^\\"]+)\\"`));
  return match ? match[1] : "";
};

const imagePaths = new Set();
let sampleLogged = 0;

console.log(`Found ${productBlocks.length} product blocks.`);

for (const block of productBlocks) {
  const id = getField(block, "id");
  if (!id) continue;

  const name = getField(block, "name");
  const brand = getField(block, "brand");
  const category = getField(block, "category");
  const unit = getField(block, "unit");
  const image = getField(block, "image");

  if (sampleLogged < 3) {
    console.log({ id, name, brand, category, unit, image });
    sampleLogged += 1;
  }

  if (!category || !name || !unit) continue;

  const finalImage = buildImagePath({ category, brand, name, unit, image });
  imagePaths.add(finalImage);
}

const jpegBase64 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBUQEBAVFhUVFRUVFRUVFRUVFRUXFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGyslICYrLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBEQACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAQIDBQYAB//EADkQAAIBAgQEAwYEBQQDAAAAAAECAwQRAAUSITFBBhMiUWEUcYGRMqGxwdHwB0JS8SMzQmKislOS/8QAGQEBAQEBAQEAAAAAAAAAAAAAAAECAwQF/8QAJhEBAQEAAgEEAgMAAAAAAAAAAAECAxESITEEQQUTIlFxgf/aAAwDAQACEQMRAD8A9wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Z";

const jpegBuffer = Buffer.from(jpegBase64, "base64");

let created = 0;
for (const imagePath of imagePaths) {
  const relativePath = imagePath.replace(/^\//, "");
  const fullPath = path.join(publicDir, relativePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, jpegBuffer);
    created += 1;
  }
}

console.log(`Collected ${imagePaths.size} image paths.`);
console.log(`Created ${created} image files under public/images.`);
