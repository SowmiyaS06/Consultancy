const UNSPLASH_IMAGE_SIZE = "600x600";

const isPlaceholderImage = (image?: string) => {
  if (!image || typeof image !== "string") {
    return true;
  }

  const normalized = image.toLowerCase();
  return (
    normalized.includes("placeholder-product.png") ||
    normalized.includes("placeholder.png")
  );
};

export const resolveProductImage = (productName: string, image?: string) => {
  if (!isPlaceholderImage(image)) {
    return image as string;
  }

  const query = encodeURIComponent((productName || "product").trim());
  return `https://source.unsplash.com/${UNSPLASH_IMAGE_SIZE}/?${query}`;
};
