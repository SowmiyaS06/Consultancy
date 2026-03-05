const UNSPLASH_IMAGE_SIZE = "600x600";

const isPlaceholderImage = (image) => {
  if (!image || typeof image !== "string") {
    return true;
  }

  const normalized = image.toLowerCase();
  return (
    normalized.includes("placeholder-product.png") ||
    normalized.includes("placeholder.png")
  );
};

const getDynamicProductImage = (productName, image) => {
  if (!isPlaceholderImage(image)) {
    return image;
  }

  const query = encodeURIComponent(String(productName || "product").trim());
  return `https://source.unsplash.com/${UNSPLASH_IMAGE_SIZE}/?${query}`;
};

const withProductImage = (product) => ({
  ...product,
  image: getDynamicProductImage(product.name, product.image),
});

module.exports = { getDynamicProductImage, withProductImage };
