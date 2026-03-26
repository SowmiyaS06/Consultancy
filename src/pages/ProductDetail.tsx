import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { products, categories } from "@/data/products";
import { ShoppingCart, Check, Star, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const getCategoryEmoji = (category: string) => {
  const emojis: Record<string, string> = {
    "daily-essentials": "🍚",
    "snacks-treats": "🍪",
    "personal-home": "🧴",
    "school-kids": "🎨",
    "kitchen-needs": "🍳",
    "fresh-items": "🧄",
  };
  return emojis[category] || "📦";
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const [imgError, setImgError] = useState(false);

  const product = products.find((p) => p.id === id);
  const category = product ? categories.find((c) => c.id === product.category) : null;
  const isInCart = product ? items.some((item) => item.id === product.id) : false;
  const discount = product?.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;
  const showImage =
    product?.image &&
    !product.image.startsWith("/placeholder") &&
    !imgError;

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F0FDF4]/20">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-[#1F2937]/70 mb-4">Product not found.</p>
            <Link to="/products">
              <Button className="bg-[#16A34A] hover:bg-[#15803d]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F0FDF4]/20">
      <Header />

      <main className="flex-1 py-8 md:py-10">
        <div className="container-custom">
          <Link
            to="/products"
            className="inline-flex items-center text-[#16A34A] hover:text-[#15803d] font-medium mb-6 transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-md border border-[#E5E7EB] aspect-square max-h-[480px]">
              {showImage ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-[#F0FDF4] flex items-center justify-center">
                  <span className="text-8xl">{getCategoryEmoji(product.category)}</span>
                </div>
              )}
              {product.isOffer && (
                <Badge className="absolute top-4 left-4 z-10 bg-[#F97316] text-white font-bold border-0 text-sm px-3 py-1">
                  {discount}% OFF
                </Badge>
              )}
            </div>

            {/* Details */}
            <div>
              {category && (
                <p className="text-sm text-[#1F2937]/60 mb-2">
                  {category.icon} {category.name}
                </p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-0.5 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                  />
                ))}
                <span className="text-sm text-gray-500 ml-2">(4) · In stock</span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold text-[#1F2937]">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                <span className="text-sm text-[#1F2937]/70">{product.unit}</span>
              </div>

              <p className="text-[#1F2937]/80 leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-[#16A34A] hover:bg-[#15803d] text-white hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    addToCart(product);
                  }}
                >
                  {isInCart ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#16A34A] text-[#16A34A] hover:bg-[#F0FDF4]"
                  onClick={() => navigate("/cart")}
                >
                  View Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
