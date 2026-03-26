import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/useAuth";
import { useToast } from "@/hooks/use-toast";
import { storeApi, type PaymentMethod, type PaymentStatus } from "@/lib/storeApi";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/paymentMethod";
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from "@/config/commerce";
import { downloadReceiptPdf } from "@/lib/receiptPdf";
import { CheckCircle2 } from "lucide-react";

const UPI_ID = "selvarajsowmiya11@okhdfcbank";
const UPI_PAYEE_NAME = "Sowmiya Consultancy";
const UPI_TRANSACTION_NOTE = "Consultancy Payment";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("cod");
  const [isUpiQrModalOpen, setIsUpiQrModalOpen] = useState(false);

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

  const formatPrice = (value: number) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue.toFixed(2) : "0.00";
  };

  const validateCheckout = () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.pincode.trim().length !== 6) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode.",
        variant: "destructive",
      });
      return false;
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some products first.",
        variant: "destructive",
      });
      return false;
    }

    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to place your order.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/checkout" }, replace: true });
      return false;
    }

    if (items.some((item) => !isMongoObjectId(item.id))) {
      toast({
        title: "Cart Needs Refresh",
        description: "Please clear cart and add products again before checkout.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const submitOrder = async (paymentStatus?: PaymentStatus) => {
    if (!validateCheckout() || !token) return;

    setIsSubmitting(true);

    try {
      const cartSnapshot = [...items];
      const { order } = await storeApi.createOrder(token, {
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        paymentMethod: selectedPaymentMethod,
        paymentStatus,
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
        paymentMethod: order.paymentMethod || selectedPaymentMethod,
        paymentStatus: order.paymentStatus || paymentStatus || "pending",
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

      setIsUpiQrModalOpen(false);
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

  const buildUpiPaymentLink = () => {
    const orderAmount = finalTotal.toFixed(2);
    return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${encodeURIComponent(orderAmount)}&cu=INR&tn=${encodeURIComponent(UPI_TRANSACTION_NOTE)}`;
  };

  const upiPaymentLink = buildUpiPaymentLink();
  const upiQrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPaymentLink)}`;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPaymentMethod === "upi") {
      if (!validateCheckout()) return;
      setIsUpiQrModalOpen(true);
      return;
    }

    void submitOrder();
  };

  const handleUpiPaymentCompleted = () => {
    void submitOrder("paid");
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
                  <RadioGroup
                    value={selectedPaymentMethod}
                    onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
                    className="space-y-3"
                  >
                    {PAYMENT_METHOD_OPTIONS.map((option) => {
                      const selected = selectedPaymentMethod === option.value;

                      return (
                        <div
                          key={option.value}
                          className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors ${
                            selected
                              ? "border-primary bg-accent/50"
                              : "border-border/70 bg-background"
                          }`}
                        >
                          <RadioGroupItem id={`payment-${option.value}`} value={option.value} className="mt-1" />
                          <Label htmlFor={`payment-${option.value}`} className="cursor-pointer">
                            <p className="font-medium text-foreground">{option.label}</p>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  {selectedPaymentMethod === "upi" && (
                    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                      <p className="text-sm text-foreground font-medium">UPI QR Payment</p>
                      <p className="text-sm text-muted-foreground">UPI ID: {UPI_ID}</p>
                      <p className="text-sm text-muted-foreground">Amount: ₹{finalTotal.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Placing Order..."
                    : selectedPaymentMethod === "upi"
                      ? `Pay via UPI - ₹${finalTotal.toFixed(2)}`
                      : `Place Order - ₹${finalTotal}`}
                </Button>
              </form>

              <Dialog open={isUpiQrModalOpen} onOpenChange={setIsUpiQrModalOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>UPI QR Payment</DialogTitle>
                    <DialogDescription>
                      Scan and Pay using Google Pay / PhonePe / Paytm
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col items-center gap-4 py-2">
                    <img
                      src={upiQrCodeSrc}
                      alt="UPI QR code"
                      className="h-[250px] w-[250px] rounded-md border border-border"
                    />
                    <div className="w-full rounded-lg border border-border/60 bg-muted/30 p-3 text-sm space-y-1">
                      <p className="text-foreground"><span className="font-medium">UPI ID:</span> {UPI_ID}</p>
                      <p className="text-foreground"><span className="font-medium">Amount:</span> ₹{finalTotal.toFixed(2)}</p>
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleUpiPaymentCompleted}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting Order..." : "I Have Completed Payment"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium text-foreground">
                      {deliveryCharge === 0 ? (
                        <span className="text-success">FREE</span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-xl text-primary">
                      {formatPrice(finalTotal)}
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
