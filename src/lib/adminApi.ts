import type { AdminProfile } from "@/types/admin";
import type { PaymentMethod, PaymentStatus } from "@/lib/storeApi";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const jsonHeaders = (token?: string | null) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }
  return data as T;
};

export interface AdminSummary {
  totalProducts: number;
  totalUsers: number;
  activeOffers: number;
  totalOrders: number;
}

export interface AdminProduct {
  _id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  unit?: string;
  stock?: number;
  inStock?: boolean;
  isActive?: boolean;
}

export interface AdminProductInput {
  name?: string;
  price?: number;
  category?: string;
  image?: string;
  imageUrl?: string;
  unit?: string;
  stock?: number;
  inStock?: boolean;
  isActive?: boolean;
}

export interface AdminOffer {
  _id: string;
  title: string;
  bannerUrl: string;
  isActive: boolean;
  products: AdminProduct[];
}

export interface AdminOfferInput {
  title?: string;
  bannerUrl?: string;
  isActive?: boolean;
  products?: string[];
}

export interface AdminOrder {
  _id: string;
  status: "placed" | "delivered" | "cancelled";
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  razorpayPaymentId?: string;
  total: number;
  user?: { name?: string; email?: string };
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  totalOrders: number;
}

export interface AdminPincode {
  _id: string;
  code: string;
  isServiceable: boolean;
}

export interface AdminDailySale {
  date: string;
  revenue: number;
}

export interface AdminTopProduct {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenueGenerated: number;
}

export interface AdminLowStockProduct {
  productId: string;
  productName: string;
  currentStock: number;
}

export interface AdminAnalytics {
  totalRevenue: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  topProducts: AdminTopProduct[];
  lowStockProducts: AdminLowStockProduct[];
  dailySales: AdminDailySale[];
}

export const adminApi = {
  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/me`, {
      headers: jsonHeaders(token),
    });
    return handleResponse<{ admin: AdminProfile }>(response);
  },
  getSummary: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/summary`, {
      headers: jsonHeaders(token),
    });
    return handleResponse<{ summary: AdminSummary }>(response);
  },
  getAnalytics: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/analytics`, {
      headers: jsonHeaders(token),
    });
    return handleResponse<AdminAnalytics>(response);
  },
  listProducts: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/products`, {
      headers: jsonHeaders(token),
    });
    return handleResponse<{ products: AdminProduct[] }>(response);
  },
  createProduct: async (token: string, payload: AdminProductInput) => {
    const response = await fetch(`${API_BASE}/api/admin/products`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ product: AdminProduct }>(response);
  },
  updateProduct: async (token: string, id: string, payload: AdminProductInput) => {
    const response = await fetch(`${API_BASE}/api/admin/products/${id}`, {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ product: AdminProduct }>(response);
  },
  toggleProduct: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE}/api/admin/products/${id}/toggle`, {
      method: "PATCH",
      headers: jsonHeaders(token),
    });
    return handleResponse<{ product: AdminProduct }>(response);
  },
  listOffers: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/offers`, {
      headers: jsonHeaders(token),
    });
    return handleResponse<{ offers: AdminOffer[] }>(response);
  },
  createOffer: async (token: string, payload: AdminOfferInput) => {
    const response = await fetch(`${API_BASE}/api/admin/offers`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ offer: AdminOffer }>(response);
  },
  updateOffer: async (token: string, id: string, payload: AdminOfferInput) => {
    const response = await fetch(`${API_BASE}/api/admin/offers/${id}`, {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ offer: AdminOffer }>(response);
  },
  toggleOffer: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE}/api/admin/offers/${id}/toggle`, {
      method: "PATCH",
      headers: jsonHeaders(token),
    });
    return handleResponse<{ offer: AdminOffer }>(response);
  },
  listOrders: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/orders`, {
      headers: jsonHeaders(token),
    });
    return handleResponse<{ orders: AdminOrder[] }>(response);
  },
  listUsers: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/users`, {
      headers: jsonHeaders(token),
    });
    return handleResponse<{ users: AdminUser[] }>(response);
  },
  updateOrderStatus: async (
    token: string,
    id: string,
    status: "placed" | "delivered" | "cancelled",
  ) => {
    const response = await fetch(`${API_BASE}/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: jsonHeaders(token),
      body: JSON.stringify({ status }),
    });
    return handleResponse<{ order: AdminOrder }>(response);
  },
  updateOrderPaymentStatus: async (
    token: string,
    id: string,
    paymentStatus: PaymentStatus,
  ) => {
    const response = await fetch(`${API_BASE}/api/admin/orders/${id}/payment-status`, {
      method: "PATCH",
      headers: jsonHeaders(token),
      body: JSON.stringify({ paymentStatus }),
    });
    return handleResponse<{ order: AdminOrder }>(response);
  },
  listPincodes: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/admin/pincodes`, {
      headers: jsonHeaders(token),
    });
    return handleResponse<{ pincodes: AdminPincode[] }>(response);
  },
  createPincode: async (token: string, code: string) => {
    const response = await fetch(`${API_BASE}/api/admin/pincodes`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify({ code }),
    });
    return handleResponse<{ pincode: AdminPincode }>(response);
  },
  updatePincode: async (token: string, id: string, payload: Partial<AdminPincode>) => {
    const response = await fetch(`${API_BASE}/api/admin/pincodes/${id}`, {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ pincode: AdminPincode }>(response);
  },
  togglePincode: async (token: string, id: string) => {
    const response = await fetch(`${API_BASE}/api/admin/pincodes/${id}/toggle`, {
      method: "PATCH",
      headers: jsonHeaders(token),
    });
    return handleResponse<{ pincode: AdminPincode }>(response);
  },
};
