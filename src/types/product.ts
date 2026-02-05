export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  unit: string;
  inStock: boolean;
  isOffer?: boolean;
  brand?: string;
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  productCount: number;
}
