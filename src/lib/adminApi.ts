import type { AdminProfile } from "@/types/admin";

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
  paymentMethod?: string;
  paymentStatus?: string;
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
