import { useEffect, useMemo, useState } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoryMeta } from "@/lib/categoryMeta";
import { resolveProductImage } from "@/lib/productImage";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, items } = useCart();
  const isInCart = items.some((item) => item.id === product.id);
  const isOutOfStock = !product.inStock;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const categoryEmoji = getCategoryMeta(product.category).icon;
  const fallbackImage = useMemo(() => resolveProductImage(product.name), [product.name]);
  const [currentImage, setCurrentImage] = useState(product.image || fallbackImage);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setCurrentImage(product.image || fallbackImage);
    setImageFailed(false);
  }, [product.image, fallbackImage]);

  const handleImageError = () => {
    if (currentImage !== fallbackImage) {
      setCurrentImage(fallbackImage);
      return;
    }
    setImageFailed(true);
  };

  return (
    <div className="relative bg-card rounded-xl overflow-hidden shadow-card card-hover border border-border/50 group">
      {/* Badges */}
      {product.isOffer && discount > 0 && (
        <Badge className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground font-bold">
          {discount}% OFF
        </Badge>
      )}
      {isOutOfStock && (
        <Badge className="absolute top-3 right-3 z-10 bg-secondary text-secondary-foreground font-semibold">
          Out of Stock
        </Badge>
      )}

      {/* Product Image */}
      <div className="relative h-36 bg-accent/30 flex items-center justify-center overflow-hidden">
        {!imageFailed ? (
          <img
            src={currentImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
        ) : (
          <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
            {categoryEmoji}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1 text-sm">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">{product.unit}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-bold text-primary">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        <Button
          variant={isOutOfStock ? "outline" : isInCart ? "success" : "cart"}
          size="sm"
          className="w-full"
          onClick={() => {
            if (!isOutOfStock) {
              addToCart(product);
            }
          }}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? (
            <>Out of Stock</>
          ) : isInCart ? (
            <>
              <Check className="h-4 w-4" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
