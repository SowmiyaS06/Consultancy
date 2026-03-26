import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, Shield, Tag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryCard from "@/components/home/CategoryCard";
import { categories as fallbackCategories } from "@/data/products";
import { FREE_DELIVERY_THRESHOLD } from "@/config/commerce";
import { storeApi } from "@/lib/storeApi";
import { buildCategoriesFromProducts } from "@/lib/categoryMeta";
import groceryImage from "@/assets/grocery.png";

const Index = () => {
  const productsQuery = useQuery({
    queryKey: ["store-products"],
    queryFn: () => storeApi.listProducts(),
  });

  const categories = useMemo(() => {
    const products = (productsQuery.data?.products || []).map((product) => ({
      category: product.category || "uncategorized",
    }));

    const dynamic = buildCategoriesFromProducts(products, fallbackCategories);
    return dynamic.length > 0 ? dynamic : fallbackCategories;
  }, [productsQuery.data?.products]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-gradient py-12 md:py-20">
          <div className="container-custom">
            <div className="hero-layout animate-fade-in">
              <div className="hero-left">
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full mb-4">
                  🛒 Your Neighborhood Store
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                  Fresh Qualitied Products at
                  <span className="text-primary"> Affordable Prices</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl">
                  From daily essentials to kitchen needs - find everything your home needs at VEL SUPER MARKET.
                  Trusted by families in our community.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link to="/products" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto shadow-card">
                      Shop Now
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/products?category=daily-essentials" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Daily Essentials
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="hero-right" aria-hidden="true">
                <img src={groceryImage} alt="Grocery shelves in supermarket" className="hero-image" />
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-8 md:py-12">
          <div className="container-custom">
            <div className="max-w-3xl">
              <div className="rounded-2xl border border-border/60 bg-card/70 p-6 md:p-8 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                      About VEL SUPER MARKET
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      VEL SUPER MARKET is a packaged-goods departmental store offering daily essentials,
                      household items, and personal care products. Our store provides a simple and
                      convenient online ordering experience along with in-store shopping.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Strip */}
        <section className="border-b border-border bg-card py-4">
          <div className="container-custom">
            <div className="flex flex-wrap justify-center md:justify-between gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-5 w-5 text-primary" />
                <span>Free Delivery Above ₹{FREE_DELIVERY_THRESHOLD}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span>Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-5 w-5 text-primary" />
                <span>Best Prices Everyday</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-16">
          <div className="container-custom">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Shop by Category
                </h2>
                <p className="text-muted-foreground">
                  Browse our carefully organized product categories
                </p>
              </div>
              <Link to="/products" className="hidden md:block">
                <Button variant="ghost">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {categories.map((category) => (
                <div key={category.id} className="animate-fade-in">
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16">
          <div className="container-custom">
            <div className="bg-primary rounded-2xl p-8 md:p-12 text-center shadow-hover">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Ready to Shop?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
                Browse our complete collection and get everything delivered to your doorstep.
              </p>
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Explore All Products
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
