import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { storeApi, type CustomerOrder } from "@/lib/storeApi";
import { downloadReceiptPdf } from "@/lib/receiptPdf";

const downloadReceipt = (order: CustomerOrder) => {
  const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = order.deliveryCharge ?? Math.max(0, order.total - subtotal);

  downloadReceiptPdf({
    orderId: order._id,
    createdAt: order.createdAt,
    status: order.status,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    pincode: order.pincode,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    notes: order.notes,
    subtotal,
    deliveryCharge,
    total: order.total,
    items: order.items.map((item) => ({
      name: item.product?.name || "Product",
      quantity: item.quantity,
      unitPrice: item.price,
    })),
  });
};

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/orders" }, replace: true });
    }
  }, [isAuthenticated, navigate]);

  const ordersQuery = useQuery({
    queryKey: ["customer-orders"],
    queryFn: () => storeApi.listOrders(token || ""),
    enabled: Boolean(token),
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-10 md:py-12">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">My Orders</h1>

          {ordersQuery.isLoading && (
            <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
          )}

          {ordersQuery.error && (
            <div className="text-center py-12 text-destructive">Failed to load orders.</div>
          )}

          {!ordersQuery.isLoading && !ordersQuery.error && (
            <div className="space-y-4">
              {(ordersQuery.data?.orders || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No orders yet. Start shopping to place your first order.
                </div>
              ) : (
                ordersQuery.data?.orders.map((order) => (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-border/60 bg-card/90 p-5 shadow-soft"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="text-sm font-medium text-foreground break-all">{order._id}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status: <span className="text-foreground font-medium">{order.status}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total: <span className="text-foreground font-medium">₹{order.total}</span>
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReceipt(order)}
                        >
                          Download Receipt
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      {order.items.map((item, index) => (
                        <div key={`${order._id}-${index}`} className="flex items-start justify-between gap-3">
                          <span className="text-foreground">
                            {item.product?.name || "Product"} × {item.quantity}
                          </span>
                          <span className="text-muted-foreground shrink-0">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
