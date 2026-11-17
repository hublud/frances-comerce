'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, CategoryType, ProductVariationType, StoreSettings, CustomerDetails, Order } from '../types';
import { PRODUCTS } from '../data/products';
import {
  saveOrderToSupabase,
  updateOrderStatusInSupabase,
  upsertProductToSupabase,
  deleteProductFromSupabase,
  syncAllProductsToSupabase,
  fetchProductsFromSupabase,
  fetchOrdersFromSupabase,
} from '../lib/supabase';
import { normalizeVariationOptions } from '../lib/colors';

interface ToastState {
  show: boolean;
  message: string;
  type: 'bag' | 'heart' | 'sparkle' | 'info' | 'warning';
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'FRANCIELLE BY FRANCES',
  tagline: 'A Little World of Lovely Things',
  subtitle: 'Girly Phone Cases, Beauty Essentials, Classy Key Holders & Timeless Accessories',
  phoneWhatsapp: '09114336301',
  phoneSecondary: '+234 911 433 6301',
  deliveryLagosFee: 0,
  deliveryLagosTime: '24-48 hours within Kaduna',
  deliveryNationwideFee: 0,
  deliveryNationwideTime: '3-4 days outside Kaduna',
  freeShippingThreshold: 0,
  announcementText: '★ FRANCIELLE BY FRANCES · A LITTLE WORLD OF LOVELY THINGS',
  currencySymbol: '₦',
  deliveryNote: 'Delivery fee depends on distance and price raised by dispatcher upon order dispatch.',
};

export function ensureProductVariations(p: Product): Product {
  if (Array.isArray(p.variations)) {
    return {
      ...p,
      variations: p.variations
        .filter((v): v is ProductVariationType => Boolean(v && typeof v === 'object' && v.name))
        .map(v => ({
          ...v,
          options: normalizeVariationOptions(v.options || []),
        })),
    };
  }

  const variations: ProductVariationType[] = [];

  if (p.category === 'cases') {
    variations.push({
      name: 'Phone Model',
      options: ['iPhone 13 / 13 Pro', 'iPhone 14 / 14 Pro', 'iPhone 15 / 15 Pro Max', 'iPhone 16 / 16 Pro Max'],
    });
    variations.push({
      name: 'Color / Style',
      options: p.colorVariants && p.colorVariants.length > 0 ? p.colorVariants : ['Blush Pink', 'Pearl Silver'],
    });
  } else if (p.category === 'beauty') {
    variations.push({
      name: 'Shade / Option',
      options: p.colorVariants && p.colorVariants.length > 0 ? p.colorVariants : ['Rose Quartz Jelly', 'Berry Glaze'],
    });
  } else if (p.category === 'accessories') {
    variations.push({
      name: 'Charm / Style',
      options: p.colorVariants && p.colorVariants.length > 0 ? p.colorVariants : ['Crystal Bow', 'Pearl Cluster'],
    });
  } else {
    // Default variations
    const colors = p.colorVariants && p.colorVariants.length > 0
      ? p.colorVariants
      : ['Blush Pink', 'Rose Quartz', 'Creamy Vanilla'];
    variations.push({ name: 'Color', options: colors });
    variations.push({ name: 'Size', options: ['S', 'M', 'L'] });
  }

  return {
    ...p,
    variations,
  };
}

interface ShopContextType {
  products: Product[];
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  cart: CartItem[];
  wishlist: string[];
  activeCategory: CategoryType;
  setActiveCategory: (cat: CategoryType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isMobileSearchOpen: boolean;
  setIsMobileSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sortBy: string;
  setSortBy: (sort: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartAnimationTrigger: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (prod: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isCategoryDrawerOpen: boolean;
  setIsCategoryDrawerOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  discountPercent: number;
  appliedCoupon: string;
  toast: ToastState;
  showToast: (msg: string, type?: ToastState['type']) => void;
  addToCart: (
    productId: string,
    qty?: number,
    variant?: string,
    selectedVariations?: Record<string, string>
  ) => void;
  updateCartQty: (index: number, delta: number) => void;
  removeCartItem: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  applyCoupon: (code: string) => boolean;
  orders: Order[];
  saveOrder: (order: Order) => Promise<boolean>;
  deleteOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  createOrder: (customer: CustomerDetails) => Promise<string>;
  orderViaWhatsApp: (customer?: CustomerDetails, customShipping?: number) => string;
  updateProduct: (updated: Product) => void;
  updateProductVariations: (productId: string, variations: ProductVariationType[]) => void;
  addProduct: (newProd: Product) => void;
  deleteProduct: (productId: string) => void;
  resetCatalog: () => void;
  syncAllToSupabase: () => Promise<{ count: number; error?: string }>;
  fetchFromSupabase: () => Promise<{ count: number; error?: string }>;
  cartTotalCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartTotal: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => PRODUCTS.map(ensureProductVariations));
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartAnimationTrigger, setCartAnimationTrigger] = useState(0);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('fancielle_custom_catalog');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed.map(ensureProductVariations));
        }
      }
      const savedSettings = localStorage.getItem('fancielle_settings');
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
      const savedCart = localStorage.getItem('fancielle_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedWish = localStorage.getItem('fancielle_wishlist');
      if (savedWish) setWishlist(JSON.parse(savedWish));
      const savedOrders = localStorage.getItem('fancielle_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      // Synchronize orders with Supabase cloud so all devices & admin see all customer orders
      fetchOrdersFromSupabase().then(remoteOrders => {
        if (remoteOrders && remoteOrders.length > 0) {
          setOrders(prev => {
            const map = new Map<string, Order>();
            prev.forEach(o => map.set(o.id.replace(/^#/, ''), o));
            remoteOrders.forEach(o => map.set(o.id.replace(/^#/, ''), o));
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            try {
              localStorage.setItem('fancielle_orders', JSON.stringify(merged));
            } catch (err) {}
            return merged;
          });
        }
      }).catch(err => {
        console.warn('Background Supabase fetchOrders note:', err);
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save custom catalog when modified
  const saveCatalog = (updatedList: Product[]) => {
    setProducts(updatedList);
    try {
      localStorage.setItem('fancielle_custom_catalog', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  // Update Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('fancielle_settings', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showToast('Store settings & contact numbers updated! 💖', 'sparkle');
  };

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem('fancielle_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save wishlist
  useEffect(() => {
    try {
      localStorage.setItem('fancielle_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  const updateProduct = (updated: Product) => {
    const updatedWithVars = ensureProductVariations(updated);
    const nextList = products.map(p => (p.id === updated.id ? updatedWithVars : p));
    saveCatalog(nextList);
    upsertProductToSupabase(updatedWithVars).catch(() => {});
    showToast(`Updated "${updated.name}" successfully! 💗`, 'sparkle');
  };

  const updateProductVariations = (productId: string, variations: ProductVariationType[]) => {
    let targetProd: Product | null = null;
    const cleanVariations = variations.map(v => ({
      ...v,
      options: normalizeVariationOptions(v.options || []),
    }));
    const nextList = products.map(p => {
      if (p.id === productId) {
        targetProd = {
          ...p,
          variations: cleanVariations,
        };
        return targetProd;
      }
      return p;
    });
    saveCatalog(nextList);
    if (targetProd) {
      upsertProductToSupabase(targetProd).catch(() => {});
    }
    showToast(`Saved variations for product! ✨`, 'sparkle');
  };

  const addProduct = (newProd: Product) => {
    const readyProd = ensureProductVariations(newProd);
    const nextList = [readyProd, ...products];
    saveCatalog(nextList);
    upsertProductToSupabase(readyProd).catch(() => {});
    showToast(`Added new product "${newProd.name}"! 🌸`, 'sparkle');
  };

  const deleteProduct = (productId: string) => {
    const nextList = products.filter(p => p.id !== productId);
    saveCatalog(nextList);
    deleteProductFromSupabase(productId).catch(() => {});
    showToast(`Product deleted.`, 'info');
  };

  const resetCatalog = () => {
    const fresh = PRODUCTS.map(ensureProductVariations);
    saveCatalog(fresh);
    localStorage.removeItem('fancielle_custom_catalog');
    showToast(`Reset catalog to factory defaults 💖`, 'sparkle');
  };

  const addToCart = (
    productId: string,
    qty = 1,
    variant?: string,
    selectedVariations?: Record<string, string>
  ) => {
    const product = products.find(p => p.id === productId) || PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    let chosenVariant = variant || '';
    if (!chosenVariant && selectedVariations && Object.keys(selectedVariations).length > 0) {
      chosenVariant = Object.entries(selectedVariations)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ');
    }
    if (!chosenVariant) {
      if (product.variations && product.variations.length > 0) {
        chosenVariant = product.variations
          .map(v => `${v.name}: ${v.options[0] || 'Standard'}`)
          .join(' · ');
      } else if (product.colorVariants && product.colorVariants.length > 0) {
        chosenVariant = `Color: ${product.colorVariants[0]}`;
      }
    }

    setCart(prev => {
      const idx = prev.findIndex(item => item.id === productId && item.variant === chosenVariant);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty += qty;
        return copy;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.categoryLabel,
          variant: chosenVariant,
          selectedVariations,
          qty
        }
      ];
    });

    showToast(`Added "${product.name}" to your bag! 💗`, 'bag');
    setCartAnimationTrigger(prev => prev + 1);
  };

  const updateCartQty = (index: number, delta: number) => {
    setCart(prev => {
      const copy = [...prev];
      if (!copy[index]) return prev;
      copy[index].qty += delta;
      if (copy[index].qty <= 0) {
        copy.splice(index, 1);
      }
      return copy;
    });
  };

  const removeCartItem = (index: number) => {
    setCart(prev => {
      const item = prev[index];
      if (item) showToast(`Removed "${item.name}" from your bag.`, 'info');
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('fancielle_cart');
  };

  const toggleWishlist = (productId: string) => {
    const product = products.find(p => p.id === productId) || PRODUCTS.find(p => p.id === productId);
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from your saved wishlist', 'heart');
        return prev.filter(id => id !== productId);
      } else {
        showToast(`Saved "${product?.name || ''}" to your wishlist! 💗`, 'heart');
        return [...prev, productId];
      }
    });
  };

  const applyCoupon = (code: string) => {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === 'GIRLY10' || cleaned === 'LOVELY10') {
      setDiscountPercent(0.10);
      setAppliedCoupon('GIRLY10');
      showToast('10% VIP Girly Discount Applied! 🌸', 'sparkle');
      return true;
    } else if (cleaned === 'FRANCES20' || cleaned === 'SPEED20') {
      setDiscountPercent(0.20);
      setAppliedCoupon('FRANCES20');
      showToast('20% Exclusive Frances Discount Applied! ✨', 'sparkle');
      return true;
    }
    showToast('Invalid promo code. Try GIRLY10', 'warning');
    return false;
  };

  // Calculations
  const cartTotalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartDiscount = Math.round(cartSubtotal * discountPercent);
  const subtotalAfterDiscount = cartSubtotal - cartDiscount;
  // Delivery prices are removed. Delivery price depends on distance and rate raised by dispatcher.
  const cartShipping = 0;
  const cartTotal = subtotalAfterDiscount;

  const saveOrder = async (newOrder: Order): Promise<boolean> => {
    // 1. Immediately store in state & localStorage for instant client access
    setOrders(prev => {
      const updated = [newOrder, ...prev.filter(o => o.id !== newOrder.id)];
      try {
        localStorage.setItem('fancielle_orders', JSON.stringify(updated));
        localStorage.setItem('fancielle_latest_order_id', newOrder.id);
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // 2. Persist to Supabase cloud database
    try {
      const ok = await saveOrderToSupabase(newOrder);
      if (!ok) {
        console.warn('Initial Supabase order save returned false, retrying...');
        await saveOrderToSupabase(newOrder);
      }
      return true;
    } catch (err) {
      console.warn('Background Supabase saveOrder warning:', err);
      return false;
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => {
      const updated = prev.filter(o => o.id !== orderId);
      try {
        localStorage.setItem('fancielle_orders', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => {
      const updated = prev.map(o => (o.id === orderId ? { ...o, status } : o));
      try {
        localStorage.setItem('fancielle_orders', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    updateOrderStatusInSupabase(orderId, status).catch(() => {});
  };

  const syncAllToSupabase = async (): Promise<{ count: number; error?: string }> => {
    return await syncAllProductsToSupabase(products);
  };

  const fetchFromSupabase = async (): Promise<{ count: number; error?: string }> => {
    const remote = await fetchProductsFromSupabase();
    if (remote === null) {
      return { count: 0, error: 'Could not fetch from Supabase. Ensure database tables are created.' };
    }
    if (remote.length > 0) {
      saveCatalog(remote);
      return { count: remote.length };
    }
    return { count: 0 };
  };

  const createOrder = async (customer: CustomerDetails): Promise<string> => {
    if (cart.length === 0) {
      showToast('Your bag is empty! Add items first.', 'warning');
      return '';
    }

    const orderId = 'FRN-' + Math.floor(10000 + Math.random() * 90000);
    const finalTotal = subtotalAfterDiscount;

    const newOrder: Order = {
      id: orderId,
      customer,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shipping: 0,
      total: finalTotal,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    // Await saving so the order is committed to Supabase before navigating
    await saveOrder(newOrder);
    clearCart();
    return orderId;
  };

  const orderViaWhatsApp = (customer?: CustomerDetails, customShipping?: number): string => {
    if (cart.length === 0) {
      showToast('Your bag is empty! Add items first.', 'warning');
      return '';
    }

    const orderId = '#FRN-' + Math.floor(10000 + Math.random() * 90000);
    const finalTotal = subtotalAfterDiscount;

    const lines: string[] = [
      `💗 *NEW ORDER - ${settings.storeName}* 💗`,
      `🏷️ *Order Reference:* ${orderId}`,
      `✨ _${settings.tagline}_`,
      ``,
    ];

    if (customer) {
      lines.push(`👤 *CUSTOMER INFORMATION:*`);
      lines.push(`• Name: *${customer.fullName}*`);
      lines.push(`• Phone (WhatsApp): *${customer.phone}*`);
      if (customer.phoneAlt) lines.push(`• Alt Phone: ${customer.phoneAlt}`);
      lines.push(`• Email: ${customer.email}`);
      lines.push(``);
      lines.push(`📍 *DELIVERY DESTINATION (NIGERIA):*`);
      lines.push(`• State: *${customer.state}*`);
      lines.push(`• City / Area: *${customer.city}*`);
      lines.push(`• Street Address: *${customer.address}*`);
      lines.push(`• 🚏 *Closest Landmark / Bus Stop:* *${customer.landmark}*`);
      if (customer.notes) lines.push(`• Special Notes: _${customer.notes}_`);
      lines.push(``);
    } else {
      lines.push(`Hello Frances! I would like to place an order from Francielle:`);
      lines.push(``);
    }

    lines.push(`📦 *ITEMS ORDERED (${cartTotalCount} pcs):*`);
    cart.forEach((item, i) => {
      lines.push(`${i + 1}. *${item.name}*`);
      if (item.variant) lines.push(`   • Details: ${item.variant}`);
      lines.push(`   • Qty: ${item.qty} × ${settings.currencySymbol}${item.price.toLocaleString()} = ${settings.currencySymbol}${(item.qty * item.price).toLocaleString()}`);
    });

    lines.push(``);
    lines.push(`----------------------------------`);
    lines.push(`Items Subtotal: ${settings.currencySymbol}${cartSubtotal.toLocaleString()}`);
    if (cartDiscount > 0) lines.push(`Discount (${appliedCoupon}): -${settings.currencySymbol}${cartDiscount.toLocaleString()}`);
    lines.push(`*ITEMS TOTAL: ${settings.currencySymbol}${finalTotal.toLocaleString()}*`);
    lines.push(`🚚 *Delivery Fee:* Determined by dispatcher based on distance`);
    lines.push(`_Note: Delivery price depends on your distance and the price raised by the dispatcher upon dispatch._`);
    lines.push(`----------------------------------`);
    lines.push(``);
    lines.push(`Please confirm delivery timeline and total with dispatcher fee. Thank you! 💗`);

    // Save order record in store history
    if (customer) {
      const newOrder: Order = {
        id: orderId,
        customer,
        items: [...cart],
        subtotal: cartSubtotal,
        discount: cartDiscount,
        shipping: 0,
        total: finalTotal,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      saveOrder(newOrder).catch(() => {});
    }

    const rawPhone = settings.phoneWhatsapp.replace(/[^0-9]/g, '');
    const phoneToSend = rawPhone.startsWith('0') ? '234' + rawPhone.slice(1) : rawPhone;

    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${phoneToSend}?text=${encoded}`, '_blank');

    return orderId;
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        settings,
        updateSettings,
        cart,
        wishlist,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        isMobileSearchOpen,
        setIsMobileSearchOpen,
        sortBy,
        setSortBy,
        isCartOpen,
        setIsCartOpen,
        cartAnimationTrigger,
        isWishlistOpen,
        setIsWishlistOpen,
        quickViewProduct,
        setQuickViewProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isCategoryDrawerOpen,
        setIsCategoryDrawerOpen,
        isAdminOpen,
        setIsAdminOpen,
        discountPercent,
        appliedCoupon,
        toast,
        showToast,
        addToCart,
        updateCartQty,
        removeCartItem,
        clearCart,
        toggleWishlist,
        applyCoupon,
        orders,
        saveOrder,
        deleteOrder,
        updateOrderStatus,
        createOrder,
        orderViaWhatsApp,
        updateProduct,
        updateProductVariations,
        addProduct,
        deleteProduct,
        resetCatalog,
        syncAllToSupabase,
        fetchFromSupabase,
        cartTotalCount,
        cartSubtotal,
        cartDiscount,
        cartShipping,
        cartTotal,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

export function buildOrderWhatsAppUrl(order: Order, phoneWhatsapp?: string, explicitUrl?: string): string {
  let orderUrl = explicitUrl;
  if (!orderUrl && typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // If testing on localhost, use the live Vercel domain so admin / Frances can open it on their phone!
    if (isLocalhost) {
      orderUrl = `https://frances-comerce.vercel.app/order?id=${order.id}`;
    } else {
      orderUrl = `${window.location.origin}/order?id=${order.id}`;
    }
  }
  if (!orderUrl) {
    orderUrl = `https://frances-comerce.vercel.app/order?id=${order.id}`;
  }

  const message = `Hello Frances! I just made an order here: ${orderUrl}`;

  const raw = (phoneWhatsapp || '09114336301').replace(/[^0-9]/g, '');
  const phone = raw.startsWith('0') ? '234' + raw.slice(1) : raw;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
