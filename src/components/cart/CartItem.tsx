import { CartItem as CartItemType } from "@/types/product";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
}

const CartItemComponent = ({ item }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();

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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card rounded-xl p-4 shadow-soft border border-border/50">
      {/* Product Image */}
      <div className="w-16 h-16 bg-accent/30 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-3xl">{getCategoryEmoji(item.category)}</span>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-sm line-clamp-1">
          {item.name}
        </h3>
        <p className="text-xs text-muted-foreground">{item.unit}</p>
        <p className="text-sm font-bold text-primary mt-1">₹{item.price}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-semibold text-foreground">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Subtotal & Remove */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:block sm:text-right">
        <p className="font-bold text-foreground">₹{item.price * item.quantity}</p>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-0 h-auto sm:mt-1"
          onClick={() => removeFromCart(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItemComponent;
