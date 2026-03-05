import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartItemComponent from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from "@/config/commerce";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";

const Cart = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();

  const deliveryCharge = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const finalTotal = totalPrice + deliveryCharge;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container-custom">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            {items.length > 0 && (
              <Button variant="ghost" className="text-destructive w-full sm:w-auto" onClick={clearCart}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Add some products to your cart to get started!
              </p>
              <Link to="/products">
                <Button size="lg">
                  Start Shopping
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            /* Cart Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 lg:sticky lg:top-24">
                  <h3 className="font-bold text-lg text-foreground mb-4">
                    Order Summary
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium text-foreground">
                        {deliveryCharge === 0 ? (
                          <span className="text-success">FREE</span>
                        ) : (
                          `₹${deliveryCharge}`
                        )}
                      </span>
                    </div>
                    {deliveryCharge > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Add ₹{FREE_DELIVERY_THRESHOLD - totalPrice} more for free delivery
                      </p>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-bold text-xl text-primary">
                        ₹{finalTotal}
                      </span>
                    </div>
                  </div>

                  <Link to="/checkout">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>

                  <Link to="/products" className="block mt-3">
                    <Button variant="ghost" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
