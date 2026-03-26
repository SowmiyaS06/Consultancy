import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/useAuth";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.jpg";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Offers", path: "/offers" },
  { name: "Cart", path: "/cart" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full overflow-hidden flex items-center justify-center shadow-card group-hover:shadow-hover transition-shadow duration-300">
    <img src={logo} alt="VEL Super Market" className="h-full w-full object-cover" />
  </div>
  <div className="hidden sm:block">
    <h1 className="text-lg md:text-xl font-bold text-primary leading-tight">
      VEL SUPER MARKET
    </h1>
    <p className="text-xs text-muted-foreground -mt-0.5">
      Fresh & Quality Products
    </p>
  </div>
</Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-accent text-primary"
                    : "text-foreground hover:bg-accent/50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2 relative">
              {!isAuthenticated ? (
                <Link to="/login">
                  <Button>Sign In</Button>
                </Link>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2"
                  >
                    {user?.name || "Profile"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {isProfileOpen && (
                    <div className="absolute right-0 top-12 z-50 min-w-44 rounded-lg border border-border bg-card shadow-soft p-2">
                      <Link
                        to="/profile"
                        className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? "bg-accent text-primary"
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.path === "/cart" && totalItems > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 px-1 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {totalItems}
                    </Badge>
                  )}
                </Link>
              ))}

              {!isAuthenticated ? (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-lg font-medium text-foreground hover:bg-accent/50"
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-medium text-foreground hover:bg-accent/50"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left px-4 py-3 rounded-lg font-medium text-foreground hover:bg-accent/50"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
