const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const jsonHeaders = (token?: string | null) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseJson = async (response: Response) => {
  const raw = await response.text();
  return raw ? JSON.parse(raw) : {};
};

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface StoreProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  image?: string;
  brand?: string;
  unit?: string;
  stock?: number;
  inStock?: boolean;
  isOffer?: boolean;
}

export interface StoreOffer {
  _id: string;
  title: string;
  bannerUrl: string;
  products: StoreProduct[];
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export type PaymentMethod = "cod" | "upi" | "card" | "netbanking";
export type PaymentStatus = "pending" | "pending verification" | "paid" | "failed";

export interface CreateOrderInput {
  items: OrderItemInput[];
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  notes?: string;
}

export interface CreateOrderResponseOrder {
  _id: string;
  status: "placed" | "delivered" | "cancelled";
  total: number;
  subtotal?: number;
  deliveryCharge?: number;
  customerName?: string;
  phone?: string;
  address?: string;
  pincode?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  createdAt: string;
  items: Array<{ product?: string | { _id?: string; name?: string }; quantity: number; price: number }>;
}

export interface CustomerOrder {
  _id: string;
  status: "placed" | "delivered" | "cancelled";
  total: number;
  subtotal?: number;
  deliveryCharge?: number;
  customerName?: string;
  phone?: string;
  address?: string;
  pincode?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  createdAt: string;
  items: Array<{
    product?: { name?: string; price?: number; image?: string };
    quantity: number;
    price: number;
  }>;
}

export const storeApi = {
  register: async (payload: { name: string; email: string; password: string }) => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJson(response);
    if (!response.ok) {
      throw new Error(data?.message || "Registration failed");
    }
    return data as { token: string; user: CustomerUser };
  },
  signup: async (payload: { name: string; email: string; password: string; phone?: string }) => {
    return storeApi.register({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    });
  },
  login: async (payload: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseJson(response);
    if (!response.ok) {
      throw new Error(data?.message || "Login failed");
    }
    return data as { token: string; user: CustomerUser };
  },
  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/auth/profile`, {
      headers: jsonHeaders(token),
    });
    const data = await parseJson(response);
    if (!response.ok) {
      throw new Error(data?.message || "Failed to load profile");
    }
    return data as { user: CustomerUser };
  },
  listProducts: async () => {
    const response = await fetch(`${API_BASE}/api/store/products`);
    const data = await parseJson(response);
    if (!response.ok) {
      throw new Error(data?.message || "Failed to load products");
    }
    return data as { products: StoreProduct[] };
  },
  listOffers: async () => {
    const response = await fetch(`${API_BASE}/api/store/offers`);
    const data = await parseJson(response);
    if (!response.ok) {
      throw new Error(data?.message || "Failed to load offers");
    }
    return data as { offers: StoreOffer[] };
  },
  createOrder: async (token: string, payload: CreateOrderInput) => {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await parseJson(response);
    if (!response.ok) {
      throw new Error(data?.message || "Order failed");
    }
    return data as { order: CreateOrderResponseOrder };
  },
  listOrders: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/orders`, {
      headers: jsonHeaders(token),
    });
    const data = await parseJson(response);
    if (!response.ok) {
      throw new Error(data?.message || "Failed to load orders");
    }
    return data as { orders: CustomerOrder[] };
  },
};
