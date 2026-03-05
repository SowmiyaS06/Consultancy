import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  MapPin,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { categories as fallbackCategories } from "@/data/products";
import {
  adminApi,
  type AdminProduct,
  type AdminProductInput,
} from "@/lib/adminApi";
import { buildCategoriesFromProducts } from "@/lib/categoryMeta";
import { resolveProductImage } from "@/lib/productImage";

const emptyProductForm = {
  name: "",
  category: "",
  unit: "",
  price: "",
  stock: "",
  imageUrl: "",
};

const sections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "users", label: "Users", icon: Users },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "pincodes", label: "Pincodes", icon: MapPin },
];

const AdminDashboard = () => {
  const { admin, token, logout } = useAdminAuth();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [editProductForm, setEditProductForm] = useState(emptyProductForm);
  const [pincodeCode, setPincodeCode] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [orderPage, setOrderPage] = useState(1);

  const tokenReady = Boolean(token);

  const summaryQuery = useQuery({
    queryKey: ["admin-summary"],
    queryFn: () => adminApi.getSummary(token || ""),
    enabled: tokenReady,
    refetchInterval: tokenReady ? 15000 : false,
  });

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => adminApi.listProducts(token || ""),
    enabled: tokenReady,
    refetchInterval: tokenReady ? 15000 : false,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.listUsers(token || ""),
    enabled: tokenReady,
  });

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => adminApi.listOrders(token || ""),
    enabled: tokenReady,
  });

  const pincodesQuery = useQuery({
    queryKey: ["admin-pincodes"],
    queryFn: () => adminApi.listPincodes(token || ""),
    enabled: tokenReady,
  });

  const createProductMutation = useMutation({
    mutationFn: (payload: AdminProductInput) => adminApi.createProduct(token || "", payload),
    onSuccess: () => {
      setProductForm(emptyProductForm);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminProductInput }) =>
      adminApi.updateProduct(token || "", id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const toggleProductMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleProduct(token || "", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "placed" | "delivered" | "cancelled" }) =>
      adminApi.updateOrderStatus(token || "", id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const createPincodeMutation = useMutation({
    mutationFn: (code: string) => adminApi.createPincode(token || "", code),
    onSuccess: () => {
      setPincodeCode("");
      queryClient.invalidateQueries({ queryKey: ["admin-pincodes"] });
    },
  });

  const togglePincodeMutation = useMutation({
    mutationFn: (id: string) => adminApi.togglePincode(token || "", id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-pincodes"] }),
  });

  useEffect(() => {
    if (!selectedProduct) {
      setEditProductForm(emptyProductForm);
      return;
    }
    setEditProductForm({
      name: selectedProduct.name || "",
      category: selectedProduct.category || "",
      unit: selectedProduct.unit || "",
      price: String(selectedProduct.price ?? ""),
      stock: String(selectedProduct.stock ?? ""),
      imageUrl: selectedProduct.image || "",
    });
  }, [selectedProduct]);

  const products = productsQuery.data?.products || [];
  const orders = ordersQuery.data?.orders || [];
  const users = usersQuery.data?.users || [];
  const pincodes = pincodesQuery.data?.pincodes || [];
  const summary = summaryQuery.data?.summary;

  const categoryOptions = useMemo(() => {
    const dynamic = buildCategoriesFromProducts(
      products.map((product) => ({ category: product.category || "uncategorized" })),
      fallbackCategories
    );
    return dynamic.length > 0 ? dynamic : fallbackCategories;
  }, [products]);

  const errorMessages = [
    summaryQuery.error,
    productsQuery.error,
    usersQuery.error,
    ordersQuery.error,
    pincodesQuery.error,
    updateProductMutation.error,
  ]
    .filter((error): error is Error => Boolean(error))
    .map((error) => error.message || "Request failed");

  const parseNumber = (value: string) => (value === "" ? undefined : Number(value));

  const pageSize = 8;

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !term || product.name.toLowerCase().includes(term);
      const matchesCategory = !productCategoryFilter || product.category === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      if (!term) return true;
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    });
  }, [users, userSearch]);

  const filteredOrders = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        order._id.toLowerCase().includes(term) ||
        (order.user?.email || "").toLowerCase().includes(term);
      const matchesStatus = !orderStatusFilter || order.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const paginate = <T,>(items: T[], page: number) => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  };

  const pagedProducts = paginate(filteredProducts, productPage);
  const pagedUsers = paginate(filteredUsers, userPage);
  const pagedOrders = paginate(filteredOrders, orderPage);

  const productPageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const userPageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const orderPageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <aside
        className={`w-full lg:shrink-0 border-b lg:border-b-0 lg:border-r border-border/60 bg-card/95 transition-all duration-200 ${
          isSidebarCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className={`flex items-center gap-2 ${isSidebarCollapsed ? "lg:hidden" : ""}`}>
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              VS
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">VEL SUPER MARKET</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="px-3 pb-3 lg:pb-0 flex lg:block gap-2 lg:space-y-1 overflow-x-auto lg:overflow-visible">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-auto lg:w-full flex-shrink-0 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {!isSidebarCollapsed && <span>{section.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-4 lg:py-4 lg:mt-auto">
          <button
            onClick={logout}
            className="w-auto lg:w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="border-b border-border/60 bg-card/95">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 md:px-6 py-4">
            <div>
              <p className="text-xs text-muted-foreground">Admin</p>
              <h1 className="text-xl font-semibold text-foreground">
                {sections.find((section) => section.id === activeSection)?.label || "Dashboard"}
              </h1>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium text-foreground">{admin?.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground break-all">{admin?.email}</p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6">
          {errorMessages.length > 0 && (
            <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {errorMessages[0]}
            </section>
          )}

          {activeSection === "dashboard" && (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-card/90 p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-foreground">{summary?.totalProducts ?? 0}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/90 p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{summary?.totalUsers ?? 0}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/90 p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{summary?.totalOrders ?? 0}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>
              </div>
            </section>
          )}

          {activeSection === "products" && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-card/90 p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4">Add Product</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={productForm.name}
                      onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Category</Label>
                    <select
                      id="product-category"
                      aria-label="Select category"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={productForm.category}
                      onChange={(event) =>
                        setProductForm({ ...productForm, category: event.target.value })
                      }
                    >
                      <option value="">Select category</option>
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.productCount})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-unit">Unit</Label>
                    <Input
                      id="product-unit"
                      placeholder="e.g. 1 kg, 500 ml, 1 pack"
                      value={productForm.unit}
                      onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price</Label>
                    <Input
                      id="product-price"
                      type="number"
                      value={productForm.price}
                      onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-stock">Stock</Label>
                    <Input
                      id="product-stock"
                      type="number"
                      value={productForm.stock}
                      onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-image">Image URL</Label>
                    <Input
                      id="product-image"
                      value={productForm.imageUrl}
                      onChange={(event) =>
                        setProductForm({ ...productForm, imageUrl: event.target.value })
                      }
                    />
                  </div>
                </div>
                <Button
                  className="mt-4"
                  onClick={() =>
                    createProductMutation.mutate({
                      name: productForm.name,
                      category: productForm.category || undefined,
                      unit: productForm.unit || undefined,
                      price: parseNumber(productForm.price) ?? 0,
                      stock: parseNumber(productForm.stock),
                      imageUrl: productForm.imageUrl || undefined,
                    })
                  }
                  disabled={createProductMutation.isPending || !productForm.name || !productForm.price}
                >
                  {createProductMutation.isPending ? "Saving..." : "Add Product"}
                </Button>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/90 p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4">Products</h2>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                  <Input
                    placeholder="Search products"
                    value={productSearch}
                    onChange={(event) => {
                      setProductSearch(event.target.value);
                      setProductPage(1);
                    }}
                    className="md:max-w-xs"
                  />
                  <select
                    aria-label="Filter category"
                    className="w-full md:w-56 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={productCategoryFilter}
                    onChange={(event) => {
                      setProductCategoryFilter(event.target.value);
                      setProductPage(1);
                    }}
                  >
                    <option value="">All categories ({products.length})</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.productCount})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="py-2">Product</th>
                        <th className="py-2">Category</th>
                        <th className="py-2">Unit</th>
                        <th className="py-2">Price</th>
                        <th className="py-2">Stock</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedProducts.map((product) => (
                        <tr key={product._id} className="border-t border-border/60">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={resolveProductImage(product.name, product.image)}
                                alt={product.name}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                              <div>
                                <p className="font-medium text-foreground">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product._id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">{product.category || "-"}</td>
                          <td className="py-3 text-muted-foreground">{product.unit || "-"}</td>
                          <td className="py-3 text-foreground">₹{product.price}</td>
                          <td className="py-3 text-foreground">{product.stock ?? 0}</td>
                          <td className="py-3">
                            <span className="rounded-full bg-accent px-2 py-1 text-xs text-muted-foreground">
                              {product.isActive ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedProduct(product)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Product</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-product-name">Name</Label>
                                      <Input
                                        id="edit-product-name"
                                        value={editProductForm.name}
                                        onChange={(event) =>
                                          setEditProductForm({
                                            ...editProductForm,
                                            name: event.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-product-category">Category</Label>
                                      <select
                                        id="edit-product-category"
                                        aria-label="Select category"
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                        value={editProductForm.category}
                                        onChange={(event) =>
                                          setEditProductForm({
                                            ...editProductForm,
                                            category: event.target.value,
                                          })
                                        }
                                      >
                                        <option value="">Select category</option>
                                        {categoryOptions.map((category) => (
                                          <option key={category.id} value={category.id}>
                                            {category.name} ({category.productCount})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-product-unit">Unit</Label>
                                      <Input
                                        id="edit-product-unit"
                                        placeholder="e.g. 1 kg, 500 ml, 1 pack"
                                        value={editProductForm.unit}
                                        onChange={(event) =>
                                          setEditProductForm({
                                            ...editProductForm,
                                            unit: event.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-product-price">Price</Label>
                                      <Input
                                        id="edit-product-price"
                                        type="number"
                                        value={editProductForm.price}
                                        onChange={(event) =>
                                          setEditProductForm({
                                            ...editProductForm,
                                            price: event.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-product-stock">Stock</Label>
                                      <Input
                                        id="edit-product-stock"
                                        type="number"
                                        value={editProductForm.stock}
                                        onChange={(event) =>
                                          setEditProductForm({
                                            ...editProductForm,
                                            stock: event.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                      <Label htmlFor="edit-product-image">Image URL</Label>
                                      <Input
                                        id="edit-product-image"
                                        value={editProductForm.imageUrl}
                                        onChange={(event) =>
                                          setEditProductForm({
                                            ...editProductForm,
                                            imageUrl: event.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      disabled={updateProductMutation.isPending}
                                      onClick={() =>
                                        updateProductMutation.mutate({
                                          id: product._id,
                                          payload: {
                                            name: editProductForm.name,
                                            category: editProductForm.category || undefined,
                                            unit: editProductForm.unit || undefined,
                                            price: parseNumber(editProductForm.price),
                                            stock: parseNumber(editProductForm.stock),
                                            imageUrl: editProductForm.imageUrl || undefined,
                                          },
                                        })
                                      }
                                    >
                                      {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => toggleProductMutation.mutate(product._id)}
                                    >
                                      {product.isActive ? "Disable" : "Enable"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleProductMutation.mutate(product._id)}
                              >
                                {product.isActive ? "Disable" : "Enable"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {pagedProducts.length} of {filteredProducts.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProductPage((prev) => Math.max(1, prev - 1))}
                      disabled={productPage === 1}
                    >
                      Previous
                    </Button>
                    <span>
                      Page {productPage} of {productPageCount}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProductPage((prev) => Math.min(productPageCount, prev + 1))}
                      disabled={productPage === productPageCount}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === "users" && (
            <section className="rounded-2xl border border-border/60 bg-card/90 p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Users</h2>
              <div className="mb-4">
                <Input
                  placeholder="Search users"
                  value={userSearch}
                  onChange={(event) => {
                    setUserSearch(event.target.value);
                    setUserPage(1);
                  }}
                  className="md:max-w-xs"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Joined</th>
                      <th className="py-2">Total Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedUsers.map((user) => (
                      <tr key={user.id} className="border-t border-border/60">
                        <td className="py-3 text-foreground">{user.name}</td>
                        <td className="py-3 text-muted-foreground">{user.email}</td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-foreground">{user.totalOrders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {pagedUsers.length} of {filteredUsers.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                    disabled={userPage === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {userPage} of {userPageCount}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUserPage((prev) => Math.min(userPageCount, prev + 1))}
                    disabled={userPage === userPageCount}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </section>
          )}

          {activeSection === "orders" && (
            <section className="rounded-2xl border border-border/60 bg-card/90 p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Orders</h2>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                <Input
                  placeholder="Search by order ID or email"
                  value={orderSearch}
                  onChange={(event) => {
                    setOrderSearch(event.target.value);
                    setOrderPage(1);
                  }}
                  className="md:max-w-xs"
                />
                <select
                  aria-label="Filter status"
                  className="w-full md:w-40 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={orderStatusFilter}
                  onChange={(event) => {
                    setOrderStatusFilter(event.target.value);
                    setOrderPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  <option value="placed">Placed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2">Order ID</th>
                      <th className="py-2">User</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Payment</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map((order) => (
                      <tr key={order._id} className="border-t border-border/60">
                        <td className="py-3 text-muted-foreground">{order._id}</td>
                        <td className="py-3 text-muted-foreground">{order.user?.email || "-"}</td>
                        <td className="py-3 text-foreground">₹{order.total}</td>
                        <td className="py-3 text-muted-foreground">
                          {order.paymentMethod || "-"} / {order.paymentStatus || "-"}
                        </td>
                        <td className="py-3 text-foreground">{order.status}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <select
                              aria-label="Order status"
                              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                              value={order.status}
                              onChange={(event) =>
                                updateOrderMutation.mutate({
                                  id: order._id,
                                  status: event.target.value as
                                    | "placed"
                                    | "delivered"
                                    | "cancelled",
                                })
                              }
                            >
                              <option value="placed">Placed</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {pagedOrders.length} of {filteredOrders.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                    disabled={orderPage === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {orderPage} of {orderPageCount}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOrderPage((prev) => Math.min(orderPageCount, prev + 1))}
                    disabled={orderPage === orderPageCount}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </section>
          )}

          {activeSection === "pincodes" && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-card/90 p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4">Add Pincode</h2>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    placeholder="Enter pincode"
                    value={pincodeCode}
                    onChange={(event) => setPincodeCode(event.target.value)}
                  />
                  <Button
                    onClick={() => createPincodeMutation.mutate(pincodeCode)}
                    disabled={!pincodeCode || createPincodeMutation.isPending}
                  >
                    {createPincodeMutation.isPending ? "Saving..." : "Add"}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/90 p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4">Serviceable Pincodes</h2>
                <div className="space-y-2">
                  {pincodes.map((pincode) => (
                    <div
                      key={pincode._id}
                      className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{pincode.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {pincode.isServiceable ? "Serviceable" : "Not serviceable"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePincodeMutation.mutate(pincode._id)}
                      >
                        Toggle
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
