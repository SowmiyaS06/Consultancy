import type { Category, Product } from "@/types/product";

type CategoryMeta = {
  name: string;
  icon: string;
  description: string;
};

const CATEGORY_META_BY_NAME: Record<string, CategoryMeta> = {
  "Daily Essentials": {
    name: "Daily Essentials",
    icon: "🛒",
    description: "Rice, Dal, Oil & everyday needs",
  },
  "Snacks & Treats": {
    name: "Snacks & Treats",
    icon: "🍪",
    description: "Biscuits, Chips & Chocolates",
  },
  "Personal & Home Care": {
    name: "Personal & Home Care",
    icon: "🧴",
    description: "Soaps, Cleaners & Care products",
  },
  "School & Kids": {
    name: "School & Kids",
    icon: "🎒",
    description: "Stationery, Toys & School supplies",
  },
  "Kitchen Needs": {
    name: "Kitchen Needs",
    icon: "🍳",
    description: "Utensils & Kitchen essentials",
  },
  "Fresh Items": {
    name: "Fresh Items",
    icon: "🥕",
    description: "Fresh produce and essentials",
  },
  "Grocery Staples": {
    name: "Grocery Staples",
    icon: "🌾",
    description: "Atta, rice, pulses and staples",
  },
  "Snacks & Biscuits": {
    name: "Snacks & Biscuits",
    icon: "🍪",
    description: "Biscuits, chips and munchies",
  },
  "Dairy & Bakery": {
    name: "Dairy & Bakery",
    icon: "🥛",
    description: "Milk, bread and bakery items",
  },
  Beverages: {
    name: "Beverages",
    icon: "🥤",
    description: "Tea, coffee, juices and soft drinks",
  },
  "Personal Care": {
    name: "Personal Care",
    icon: "🧼",
    description: "Body care and hygiene products",
  },
  "Home Care / Cleaning": {
    name: "Home Care / Cleaning",
    icon: "🧹",
    description: "Cleaning and household supplies",
  },
  "Baby Care": {
    name: "Baby Care",
    icon: "🍼",
    description: "Baby food, diapers and care products",
  },
  "Health & Wellness": {
    name: "Health & Wellness",
    icon: "💊",
    description: "Healthcare and wellness products",
  },
  "Stationery & Misc": {
    name: "Stationery & Misc",
    icon: "📚",
    description: "School and office stationery",
  },
  "Pet Care": {
    name: "Pet Care",
    icon: "🐾",
    description: "Food and care for pets",
  },
};

const LEGACY_CATEGORY_ALIAS: Record<string, string> = {
  "daily-essentials": "Daily Essentials",
  "snacks-treats": "Snacks & Treats",
  "personal-home": "Personal & Home Care",
  "school-kids": "School & Kids",
  "kitchen-needs": "Kitchen Needs",
  "fresh-items": "Fresh Items",
  "grocery-staples": "Grocery Staples",
  "snacks-biscuits": "Snacks & Biscuits",
  "dairy-bakery": "Dairy & Bakery",
  beverages: "Beverages",
  "personal-care": "Personal Care",
  "home-care": "Home Care / Cleaning",
  "baby-care": "Baby Care",
  "health-wellness": "Health & Wellness",
  stationery: "Stationery & Misc",
  "pet-care": "Pet Care",
};

const titleCaseFromId = (id: string) =>
  id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getCategoryMeta = (id: string, fallback?: CategoryMeta): CategoryMeta => {
  if (CATEGORY_META_BY_NAME[id]) {
    return CATEGORY_META_BY_NAME[id];
  }

  const aliasName = LEGACY_CATEGORY_ALIAS[id];
  if (aliasName && CATEGORY_META_BY_NAME[aliasName]) {
    return CATEGORY_META_BY_NAME[aliasName];
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
