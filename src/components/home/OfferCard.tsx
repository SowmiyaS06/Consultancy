import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OfferCardProps {
  product: Product;
}

const OfferCard = ({ product }: OfferCardProps) => {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="relative bg-card rounded-xl overflow-hidden shadow-card card-hover border border-border/50 group">
      {/* Discount Badge */}
      <Badge className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground font-bold">
        {discount}% OFF
      </Badge>

      {/* Product Image */}
      <div className="relative h-40 bg-accent/30 flex items-center justify-center overflow-hidden">
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {product.category === "daily-essentials" && "🍚"}
          {product.category === "snacks-treats" && "🍪"}
          {product.category === "personal-home" && "🧴"}
          {product.category === "school-kids" && "🎨"}
          {product.category === "kitchen-needs" && "🍳"}
          {product.category === "fresh-items" && "🧄"}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-foreground mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{product.unit}</p>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        <Button
          variant="cart"
          size="sm"
          className="w-full"
          onClick={() => addToCart(product)}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default OfferCard;
