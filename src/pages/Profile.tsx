import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/useAuth";
import { storeApi } from "@/lib/storeApi";

const Profile = () => {
  const { user, token } = useAuth();

  const ordersQuery = useQuery({
    queryKey: ["customer-orders", "profile"],
    queryFn: () => storeApi.listOrders(token || ""),
    enabled: Boolean(token),
  });

  const totalSpent = useMemo(() => {
    return (ordersQuery.data?.orders || []).reduce((sum, order) => sum + order.total, 0);
  }, [ordersQuery.data?.orders]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-10 md:py-12">
        <div className="container-custom space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Profile</h1>

          <section className="rounded-2xl border border-border/60 bg-card/90 p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground mb-4">Account Details</h2>
            <div className="space-y-2 text-sm md:text-base">
              <p className="text-muted-foreground">
                Name: <span className="text-foreground font-medium">{user?.name || "-"}</span>
              </p>
              <p className="text-muted-foreground">
                Email: <span className="text-foreground font-medium">{user?.email || "-"}</span>
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card/90 p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order History</h2>

            {ordersQuery.isLoading ? (
              <p className="text-muted-foreground text-sm">Loading orders...</p>
            ) : ordersQuery.error ? (
              <p className="text-destructive text-sm">Failed to load order history.</p>
            ) : (ordersQuery.data?.orders || []).length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Total orders: <span className="text-foreground font-medium">{ordersQuery.data?.orders.length}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Total spent: <span className="text-foreground font-medium">₹{totalSpent}</span>
                </p>
                <div className="space-y-2">
                  {ordersQuery.data?.orders.map((order) => (
                    <div key={order._id} className="rounded-lg border border-border/60 p-3 text-sm">
                      <p className="text-foreground font-medium">Order #{order._id}</p>
                      <p className="text-muted-foreground">Status: {order.status}</p>
                      <p className="text-muted-foreground">Total: ₹{order.total}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
