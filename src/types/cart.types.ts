// src/types/cart.types.ts

export interface CartItem {
  productId: string;
  shadeId?: string;
  quantity: number;
  addedAt?: Date;
}

export interface CartProductDetails {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  category?: string;
  shade?: {
    id: string;
    name: string;
    hex?: string;
  };
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  qualifiesForFreeShipping: boolean;
  freeShippingThreshold: number;
}

// Pour les webhooks Stripe
export interface CheckoutSessionData {
  items: CartItem[];
  customerEmail?: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
}