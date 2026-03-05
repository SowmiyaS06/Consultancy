import type { Category, Product } from "@/types/product";

type CategoryMeta = {
  name: string;
  icon: string;
  description: string;
};

const CATEGORY_META_BY_ID: Record<string, CategoryMeta> = {
  "daily-essentials": {
    name: "Daily Essentials",
    icon: "🛒",
    description: "Rice, Dal, Oil & everyday needs",
  },
  "snacks-treats": {
    name: "Snacks & Treats",
    icon: "🍪",
    description: "Biscuits, Chips & Chocolates",
  },
  "personal-home": {
    name: "Personal & Home Care",
    icon: "🧴",
    description: "Soaps, Cleaners & Care products",
  },
  "school-kids": {
    name: "School & Kids",
    icon: "📚",
    description: "Stationery, Toys & School supplies",
  },
  "kitchen-needs": {
    name: "Kitchen Needs",
    icon: "🍳",
    description: "Utensils & Kitchen essentials",
  },
  "fresh-items": {
    name: "Fresh Items",
    icon: "🧄",
    description: "Fresh produce and essentials",
  },
  "grocery-staples": {
    name: "Grocery Staples",
    icon: "🌾",
    description: "Atta, rice, pulses and staples",
  },
  "snacks-biscuits": {
    name: "Snacks & Biscuits",
    icon: "🍿",
    description: "Biscuits, chips and munchies",
  },
  "dairy-bakery": {
    name: "Dairy & Bakery",
    icon: "🥛",
    description: "Milk, bread and bakery items",
  },
  beverages: {
    name: "Beverages",
    icon: "🥤",
    description: "Tea, coffee, juices and soft drinks",
  },
  "personal-care": {
    name: "Personal Care",
    icon: "🧼",
    description: "Body care and hygiene products",
  },
  "home-care": {
    name: "Home Care",
    icon: "🧹",
    description: "Cleaning and household supplies",
  },
  "kitchen-essentials": {
    name: "Kitchen Essentials",
    icon: "🍽️",
    description: "Cooking aids and kitchen utilities",
  },
  "baby-care": {
    name: "Baby Care",
    icon: "👶",
    description: "Baby food, diapers and care products",
  },
  "health-wellness": {
    name: "Health & Wellness",
    icon: "💊",
    description: "Healthcare and wellness products",
  },
  stationery: {
    name: "Stationery",
    icon: "✏️",
    description: "School and office stationery",
  },
  "pet-care": {
    name: "Pet Care",
    icon: "🐾",
    description: "Food and care for pets",
  },
};

const titleCaseFromId = (id: string) =>
  id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getCategoryMeta = (id: string, fallback?: CategoryMeta): CategoryMeta => {
  if (CATEGORY_META_BY_ID[id]) {
    return CATEGORY_META_BY_ID[id];
  }

  if (fallback) {
    return fallback;
  }

  return {
    name: titleCaseFromId(id),
    icon: "📦",
    description: "Browse products in this category",
  };
};

export const buildCategoriesFromProducts = (
  products: Pick<Product, "category">[],
  fallbackCategories: Category[] = []
): Category[] => {
  const countMap = new Map<string, number>();
  for (const product of products) {
    const categoryId = (product.category || "uncategorized").trim();
    countMap.set(categoryId, (countMap.get(categoryId) || 0) + 1);
  }

  const fallbackMap = new Map(fallbackCategories.map((category) => [category.id, category]));
  const fallbackOrder = fallbackCategories.map((category) => category.id);

  const presentIds = Array.from(countMap.keys());
  const sortedIds = [
    ...fallbackOrder.filter((id) => countMap.has(id)),
    ...presentIds
      .filter((id) => !fallbackOrder.includes(id))
      .sort((left, right) => (countMap.get(right) || 0) - (countMap.get(left) || 0)),
  ];

  return sortedIds.map((id) => {
    const fallback = fallbackMap.get(id);
    const meta = getCategoryMeta(
      id,
      fallback
        ? {
            name: fallback.name,
            icon: fallback.icon,
            description: fallback.description,
          }
        : undefined
    );

    return {
      id,
      name: meta.name,
      icon: meta.icon,
      description: meta.description,
      productCount: countMap.get(id) || 0,
    };
  });
};
