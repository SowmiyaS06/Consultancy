import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { storeApi, type StoreOffer, type StoreProduct } from "@/lib/storeApi";
import { resolveProductImage } from "@/lib/productImage";
import type { Product } from "@/types/product";

const Offers = () => {
  const getDiscountRateForOffer = (title: string) => {
    const normalized = title.toLowerCase();

    if (normalized.includes("bonanza")) return 0.25;
    if (normalized.includes("festival")) return 0.22;
    if (normalized.includes("mega")) return 0.2;
    if (normalized.includes("delight")) return 0.18;
    if (normalized.includes("comfort")) return 0.17;
    if (normalized.includes("wellness")) return 0.16;
    if (normalized.includes("essentials")) return 0.15;

    return 0.14;
  };

  const getOfferOriginalPrice = (price: number, discountRate: number, originalPrice?: number) => {
    if (typeof originalPrice === "number" && originalPrice > price) {
      return originalPrice;
    }

    const safeRate = Math.min(Math.max(discountRate, 0.05), 0.6);
    const derived = Math.round(price / (1 - safeRate));
    return derived > price ? derived : price + 10;
  };

  const offersQuery = useQuery({
    queryKey: ["store-offers"],
    queryFn: () => storeApi.listOffers(),
  });

  const mapProduct = (product: StoreProduct, offerTitle: string): Product => {
    const discountRate = getDiscountRateForOffer(offerTitle);

    return {
    id: product._id,
    name: product.name,
    price: product.price,
    originalPrice: getOfferOriginalPrice(product.price, discountRate, product.originalPrice),
    category: product.category || "uncategorized",
    image: resolveProductImage(product.name, product.image),
    unit: product.unit || "unit",
    inStock: product.inStock ?? (product.stock ?? 0) > 0,
    isOffer: true,
    };
  };

  const offerProducts = (offersQuery.data?.offers || [])
    .flatMap((offer: StoreOffer) =>
      offer.products.map((product) => mapProduct(product, offer.title)),
    )
    .reduce<Product[]>((acc, product) => {
      if (acc.some((item) => item.id === product.id)) {
        return acc;
      }
      acc.push(product);
      return acc;
    }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-10 md:py-12">
        <div className="container-custom">
          <section className="rounded-3xl overflow-hidden border border-border/60 bg-card/90 shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="p-6 md:p-10">
                <p className="text-sm font-medium text-primary mb-2">Limited Time Deals</p>
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
                  Great Savings on Daily Essentials
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Explore curated offers across grocery, snacks, and home care.
                </p>
              </div>
              <div className="relative h-52 md:h-72">
                <img
                  src="/images/hero-grocery.png"
                  alt="Offers banner"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </section>

          <section className="mt-10 md:mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                  Offer Products
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  {offerProducts.length} products with active discounts
                </p>
              </div>
            </div>

            {offersQuery.isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading offers...</div>
            ) : offersQuery.error ? (
              <div className="text-center py-12 text-destructive">Failed to load offers.</div>
            ) : offerProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-2xl mb-2">🛒</p>
                <p className="text-muted-foreground">
                  No offers available right now. Please check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                {offerProducts.map((product) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Offers;
