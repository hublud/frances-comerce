'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  getSupabaseClient,
  getSupabaseConfig,
  rowToProduct,
  rowToOrder,
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
  const normalizedImages = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : ([p.image, p.hoverImage].filter(Boolean) as string[]);

  const safeImages = normalizedImages.length > 0 ? normalizedImages : ['/assets/images/p-acc-1.jpg'];

  const cleanedVariations: ProductVariationType[] = Array.isArray(p.variations)
    ? p.variations
        .filter((v): v is ProductVariationType => Boolean(v && typeof v === 'object' && v.name))
        .map(v => ({
          ...v,
          options: normalizeVariationOptions(v.options || []).filter(Boolean),
        }))
        .filter(v => v.options.length > 0)
    : [];

  return {
    ...p,
    price: Number(p.price) || 0,
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    rating: Number(p.rating) || 5.0,
    reviews: Number(p.reviews) || 0,
    image: p.image || safeImages[0],
    images: safeImages,
    variations: cleanedVariations,
  };
}

interface ShopContextType {
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;
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
  updateProduct: (updated: Product) => Promise<void>;
  updateProductVariations: (productId: string, variations: ProductVariationType[]) => Promise<void>;
  addProduct: (newProd: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  resetCatalog: () => Promise<void>;
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
  // Live products: Initialize empty so we NEVER flash stale hardcoded items
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
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

  // 1. Core live initialization: purge local catalog caches & stream directly from Supabase
  useEffect(() => {
    // A. Permanently purge any stale local catalog cache & invalid credentials from this browser
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('fancielle_custom_catalog');
        localStorage.removeItem('fancielle_deleted_product_ids');
        localStorage.removeItem('fancielle_supabase_config');
      } catch (e) {}

      // Prompt Service Worker to discard obsolete caches
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          for (const reg of regs) {
            reg.update().catch(() => {});
          }
        }).catch(() => {});
      }
    }

    // B. Load user preferences (cart, wishlist, orders) from storage
    try {
      const savedSettings = localStorage.getItem('fancielle_settings');
      if (savedSettings) setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      const savedCart = localStorage.getItem('fancielle_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedWish = localStorage.getItem('fancielle_wishlist');
      if (savedWish) setWishlist(JSON.parse(savedWish));
      const savedOrders = localStorage.getItem('fancielle_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {}

    // C. Fetch live products from Supabase
    setIsLoadingProducts(true);
    fetchProductsFromSupabase()
      .then(remoteProducts => {
        if (remoteProducts !== null) {
          setProducts(remoteProducts.map(ensureProductVariations));
        } else {
          // If network failed completely, keep existing state without forcing starter products
          setProducts(prev => (prev.length > 0 ? prev : []));
        }
      })
      .catch(err => {
        console.warn('Live Supabase fetch error:', err);
      })
      .finally(() => {
        setIsLoadingProducts(false);
      });

    // D. Fetch live orders from Supabase
    fetchOrdersFromSupabase()
      .then(remoteOrders => {
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
      })
      .catch(() => {});

    // E. Supabase Realtime multi-device WebSocket subscription
    const config = getSupabaseConfig();
    const canUseRealtime = Boolean(config.anonKey && !config.anonKey.startsWith('sb_secret_'));
    const client = canUseRealtime ? getSupabaseClient() : null;
    let productChannel: any = null;
    let orderChannel: any = null;

    if (client) {
      try {
        productChannel = client
          .channel('realtime:store_products_live')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            (payload: any) => {
              if (payload.eventType === 'INSERT' && payload.new) {
                const inserted = ensureProductVariations(rowToProduct(payload.new));
                setProducts(prev => [inserted, ...prev.filter(p => p.id !== inserted.id)]);
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                const updated = ensureProductVariations(rowToProduct(payload.new));
                setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
              } else if (payload.eventType === 'DELETE' && payload.old) {
                const deletedId = payload.old.id;
                if (deletedId) {
                  setProducts(prev => prev.filter(p => p.id !== deletedId));
                  setCart(prev => prev.filter(item => item.id !== deletedId));
                  setWishlist(prev => prev.filter(id => id !== deletedId));
                }
              }
            }
          )
          .subscribe();

        orderChannel = client
          .channel('realtime:store_orders_live')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload: any) => {
              if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new) {
                const order = rowToOrder(payload.new);
                setOrders(prev => {
                  const map = new Map<string, Order>();
                  prev.forEach(o => map.set(o.id.replace(/^#/, ''), o));
                  map.set(order.id.replace(/^#/, ''), order);
                  return Array.from(map.values()).sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  );
                });
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription error:', err);
      }
    }

    // F. Re-check on tab focus / document visibility so user always sees the newest catalog
    const handleRecheck = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchProductsFromSupabase().then(remote => {
          if (remote !== null) {
            setProducts(remote.map(ensureProductVariations));
          }
        }).catch(() => {});
      }
    };
    window.addEventListener('visibilitychange', handleRecheck);
    window.addEventListener('focus', handleRecheck);

    // G. Continuous multi-device live polling: automatically refresh catalog every 15s when window is active
    const pollTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchProductsFromSupabase().then(remote => {
          if (remote !== null && remote.length > 0) {
            setProducts(remote.map(ensureProductVariations));
          }
        }).catch(() => {});
      }
    }, 15000);

    return () => {
      if (client && productChannel) client.removeChannel(productChannel);
      if (client && orderChannel) client.removeChannel(orderChannel);
      window.removeEventListener('visibilitychange', handleRecheck);
      window.removeEventListener('focus', handleRecheck);
      clearInterval(pollTimer);
    };
  }, []);

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

  // Live Database Actions
  const updateProduct = async (updated: Product) => {
    const updatedWithVars = ensureProductVariations(updated);
    setProducts(prev => prev.map(p => (p.id === updated.id ? updatedWithVars : p)));
    const res = await upsertProductToSupabase(updatedWithVars);
    if (!res.ok) {
      showToast(`Warning: Failed to update "${updated.name}": ${res.error || 'Check connection'}`, 'warning');
    } else {
      showToast(`Updated "${updated.name}" in live database! 💗`, 'sparkle');
    }
  };

  const updateProductVariations = async (productId: string, variations: ProductVariationType[]) => {
    const cleanVariations = variations.map(v => ({
      ...v,
      options: normalizeVariationOptions(v.options || []),
    }));

    let updatedProd: Product | null = null;
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          updatedProd = { ...p, variations: cleanVariations };
          return updatedProd;
        }
        return p;
      })
    );

    if (updatedProd) {
      const res = await upsertProductToSupabase(updatedProd);
      if (!res.ok) {
        showToast(`Failed to save variations: ${res.error || 'Check connection'}`, 'warning');
      } else {
        showToast('Variations saved to live database! ✨', 'sparkle');
        fetchProductsFromSupabase().then(remote => {
          if (remote !== null) setProducts(remote.map(ensureProductVariations));
        }).catch(() => {});
      }
    }
  };

  const addProduct = async (newProd: Product) => {
    const readyProd = ensureProductVariations(newProd);
    setProducts(prev => [readyProd, ...prev.filter(p => p.id !== readyProd.id)]);
    const res = await upsertProductToSupabase(readyProd);
    if (!res.ok) {
      showToast(`Warning: Failed to add "${newProd.name}": ${res.error || 'Check connection'}`, 'warning');
    } else {
      showToast(`Added "${newProd.name}" to live database! 🌸`, 'sparkle');
      fetchProductsFromSupabase().then(remote => {
        if (remote !== null) setProducts(remote.map(ensureProductVariations));
      }).catch(() => {});
    }
  };

  const deleteProduct = async (productId: string) => {
    const previousProducts = products;
    // Optimistic UI update
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCart(prev => prev.filter(item => item.id !== productId));
    setWishlist(prev => prev.filter(id => id !== productId));

    // Live Supabase delete (SDK + direct REST fallback)
    const res = await deleteProductFromSupabase(productId);
    if (!res.ok) {
      // Revert if database delete failed
      setProducts(previousProducts);
      showToast(`Delete failed: ${res.error || 'Database error. Please check your connection.'}`, 'warning');
      return;
    }

    showToast('Product permanently deleted from database. 🌸', 'info');
    fetchProductsFromSupabase().then(remote => {
      if (remote !== null) setProducts(remote.map(ensureProductVariations));
    }).catch(() => {});
  };

  const resetCatalog = async () => {
    const fresh = PRODUCTS.map(ensureProductVariations);
    setProducts(fresh);
    const res = await syncAllProductsToSupabase(fresh);
    if (res.error) {
      showToast('Could not reset database catalog: ' + res.error, 'warning');
    } else {
      showToast(`Restored all ${fresh.length} starter products to live database! 💖`, 'sparkle');
    }
  };

  const refreshProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const remote = await fetchProductsFromSupabase();
      if (remote !== null) {
        setProducts(remote.map(ensureProductVariations));
        showToast(`Pulled ${remote.length} live products from database! 💖`, 'sparkle');
      } else {
        showToast('Could not reach live database.', 'warning');
      }
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchFromSupabase = async (): Promise<{ count: number; error?: string }> => {
    setIsLoadingProducts(true);
    try {
      const remote = await fetchProductsFromSupabase();
      if (remote === null) {
        return { count: 0, error: 'Could not fetch from Supabase. Ensure database is active.' };
      }
      const formatted = remote.map(ensureProductVariations);
      setProducts(formatted);
      return { count: formatted.length };
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const addToCart = (
    productId: string,
    qty = 1,
    variant?: string,
    selectedVariations?: Record<string, string>
  ) => {
    const product = products.find(p => p.id === productId);
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
          qty,
        },
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
    const product = products.find(p => p.id === productId);
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
        isLoadingProducts,
        refreshProducts,
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
