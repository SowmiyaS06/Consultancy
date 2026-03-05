import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/useAuth";
import { storeApi } from "@/lib/storeApi";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showAdminHint, setShowAdminHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string })?.from || "/checkout";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setShowAdminHint(false);
    setIsSubmitting(true);

    try {
      const data = await storeApi.login({ email, password });
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message === "User does not have an account") {
        setError("No customer account found for this email.");
        setShowAdminHint(true);
      } else {
        setError(message);
        setShowAdminHint(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 md:py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card/90 p-6 md:p-8 shadow-soft">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Sign In</h1>
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              Login to continue to checkout.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="identifier">Email *</Label>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {showAdminHint && (
                <p className="text-sm text-muted-foreground">
                  Trying to sign in as admin?{" "}
                  <Link to="/admin/login" className="text-primary font-medium hover:underline">
                    Go to admin login
                  </Link>
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                state={{ from }}
                className="text-primary font-medium hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
