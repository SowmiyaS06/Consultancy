import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { categories as fallbackCategories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { storeApi, type StoreProduct } from "@/lib/storeApi";
import { resolveProductImage } from "@/lib/productImage";
import { buildCategoriesFromProducts } from "@/lib/categoryMeta";
import type { Product } from "@/types/product";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const productsQuery = useQuery({
    queryKey: ["store-products"],
    queryFn: () => storeApi.listProducts(),
  });

  const mapProduct = (product: StoreProduct): Product => ({
    id: product._id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    category: product.category || "uncategorized",
    image: resolveProductImage(product.name, product.image),
    unit: product.unit || "unit",
    inStock: product.inStock ?? (product.stock ?? 0) > 0,
    isOffer: Boolean(product.isOffer),
  });

  const products = (productsQuery.data?.products || []).map(mapProduct);

  const categories = useMemo(() => {
    const dynamic = buildCategoriesFromProducts(products, fallbackCategories);
    return dynamic.length > 0 ? dynamic : fallbackCategories;
  }, [products]);

  const selectedCategory = searchParams.get("category") || "all";

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container-custom">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              All Products
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} products available
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Category Filters - Desktop */}
            <aside
              className={`${
                showFilters ? "block" : "hidden"
              } md:block w-full md:w-56 shrink-0`}
            >
              <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50 sticky top-24">
                <h3 className="font-bold text-foreground mb-4">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === "all"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent"
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {productsQuery.isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading products...
                </div>
              ) : productsQuery.error ? (
                <div className="text-center py-12 text-destructive">
                  Failed to load products.
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-muted-foreground">
                    No products found. Try a different search or category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="animate-fade-in">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
