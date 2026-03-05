import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/useAuth";
import { useToast } from "@/hooks/use-toast";
import { storeApi } from "@/lib/storeApi";
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from "@/config/commerce";
import { downloadReceiptPdf } from "@/lib/receiptPdf";
import { CheckCircle2 } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const deliveryCharge = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const finalTotal = totalPrice + deliveryCharge;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    notes: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" }, replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [isAuthenticated, items.length, navigate]);

  const isMongoObjectId = (value: string) => /^[a-f0-9]{24}$/i.test(value);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.pincode.trim().length !== 6) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some products first.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to place your order.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/checkout" }, replace: true });
      return;
    }

    if (items.some((item) => !isMongoObjectId(item.id))) {
      toast({
        title: "Cart Needs Refresh",
        description: "Please clear cart and add products again before checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const cartSnapshot = [...items];
      const { order } = await storeApi.createOrder(token, {
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        paymentMethod: "cod",
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
        notes: formData.notes,
      });

      const productNameMap = new Map(cartSnapshot.map((item) => [item.id, item.name]));
      const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const resolvedDeliveryCharge =
        order.deliveryCharge ?? Math.max(0, (order.total ?? finalTotal) - subtotal);

      downloadReceiptPdf({
        orderId: order._id,
        createdAt: order.createdAt || new Date().toISOString(),
        status: order.status || "placed",
        customerName: order.customerName || formData.name,
        phone: order.phone || formData.phone,
        address: order.address || formData.address,
        pincode: order.pincode || formData.pincode,
        paymentMethod: order.paymentMethod || "cod",
        paymentStatus: order.paymentStatus || "pending",
        notes: order.notes || formData.notes,
        subtotal,
        deliveryCharge: resolvedDeliveryCharge,
        total: order.total ?? finalTotal,
        items: order.items.map((item) => {
          const productId =
            typeof item.product === "string"
              ? item.product
              : (item.product?._id ?? "");

          return {
            name: productNameMap.get(productId) || item.product?.name || "Product",
            quantity: item.quantity,
            unitPrice: item.price,
          };
        }),
      });

      setOrderPlaced(true);
      clearCart();

      toast({
        title: "Order Placed Successfully! 🎉",
        description: "Receipt downloaded. We'll contact you shortly to confirm your order.",
      });
    } catch (err) {
      toast({
        title: "Order Failed",
        description: err instanceof Error ? err.message : "Unable to place order.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center max-w-md px-4 animate-scale-in">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for shopping with VEL SUPER MARKET. We'll contact you at{" "}
              <strong>{formData.phone}</strong> to confirm your order and delivery time.
            </p>
            <Button onClick={() => navigate("/products")} size="lg">
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50">
                  <h2 className="font-bold text-lg text-foreground mb-4">
                    Delivery Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        placeholder="Enter 6-digit pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Enter your complete address with landmark"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any special instructions for delivery"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50">
                  <h2 className="font-bold text-lg text-foreground mb-4">
                    Payment Method
                  </h2>
                  <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg border-2 border-primary">
                    <div className="w-4 h-4 bg-primary rounded-full" />
                    <div>
                      <p className="font-medium text-foreground">
                        Cash on Delivery
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pay when your order arrives
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Placing Order..." : `Place Order - ₹${finalTotal}`}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 lg:sticky lg:top-24">
                <h3 className="font-bold text-lg text-foreground mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm pb-2 border-b border-border"
                    >
                      <span className="text-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-foreground">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4">
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
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-xl text-primary">
                      ₹{finalTotal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
