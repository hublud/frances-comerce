export type CategoryType = 'all' | 'cases' | 'beauty' | 'accessories' | 'lifestyle' | 'basics' | 'bed' | 'travel';

export interface ProductVariationType {
  name: string; // e.g. "Color", "Size", "Phone Model", "Style", "Material"
  options: string[]; // e.g. ["Blush Pink", "Rose Quartz"] or ["iPhone 15 Pro", "iPhone 16 Pro Max"]
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  subtitle: string;
  phoneWhatsapp: string;
  phoneSecondary: string;
  deliveryLagosFee: number;
  deliveryLagosTime: string;
  deliveryNationwideFee: number;
  deliveryNationwideTime: string;
  freeShippingThreshold: number;
  announcementText: string;
  currencySymbol: string;
  deliveryNote?: string;
  logoUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  isOutOfStock?: boolean;
  badges: string[];
  image: string;
  hoverImage?: string;
  images?: string[];
  description: string;
  features?: string[];
  colorVariants?: string[];
  sizeVariants?: string[];
  variations?: ProductVariationType[];
  tags: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  variant?: string;
  selectedVariations?: Record<string, string>;
  qty: number;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  phoneAlt?: string;
  email: string;
  state: string;
  city: string;
  address: string;
  landmark: string; // Closest landmark / popular bus stop
  notes?: string;
}

export interface Order {
  id: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: string;
  status: 'pending' | 'processing' | 'delivered';
}

export interface ConciergeChoice {
  event: string;
  vibe: string;
  aura: string;
  notes: string;
}

export interface CuratedLook {
  event: string;
  vibe: string;
  aura: string;
  notes: string;
  lookTitle: string;
  tagline: string;
  items: Product[];
  subtotal: number;
  bundlePrice: number;
  savings: number;
  stylistNote: string;
}
