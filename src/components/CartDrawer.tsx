'use client';

import React, { useState } from 'react';
import SafeImage from './SafeImage';
import { useShop } from '../context/ShopContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, MessageCircle, Truck } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateCartQty,
    removeCartItem,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    applyCoupon,
    appliedCoupon,
    orderViaWhatsApp,
  } = useShop();

  const [couponCode, setCouponCode] = useState('');

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto max-h-[92vh] md:max-h-full w-full md:max-w-md bg-card rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none shadow-2xl flex flex-col overflow-hidden animate-slide-up border-l border-border">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base sm:text-lg text-foreground">
              Your Bag ({cart.reduce((s, i) => s + i.qty, 0)})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary"
            aria-label="Close Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delivery Policy Note */}
        <div className="bg-secondary/40 px-4 py-2.5 border-b border-border flex items-start gap-2.5">
          <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-snug">
            <strong className="text-foreground">Prompt Delivery Across Nigeria:</strong> Delivery fee is not fixed — it depends on your distance and is billed by the dispatcher upon dispatch.
          </p>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-border">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🛍️</div>
              <h4 className="text-base font-bold text-foreground mb-1">
                Your bag is empty 💗
              </h4>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                Explore our curated collections of phone cases, beauty essentials, bow grips, and lovely girly accessories.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="py-3.5 flex gap-3 first:pt-0">
                <div className="relative w-18 h-18 rounded-xl overflow-hidden border border-border bg-secondary shrink-0">
                  <SafeImage src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{item.name}</h4>
                      {item.variant && (
                        <p className="text-[11px] text-muted-foreground">{item.variant}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeCartItem(idx)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      ₦{(item.price * item.qty).toLocaleString()}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-full px-2 py-0.5">
                      <button
                        onClick={() => updateCartQty(idx, -1)}
                        className="text-muted-foreground hover:text-primary p-0.5"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-foreground px-1.5">{item.qty}</span>
                      <button
                        onClick={() => updateCartQty(idx, 1)}
                        className="text-muted-foreground hover:text-primary p-0.5"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border bg-background/80 space-y-3">
            {/* Promo Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo Code (e.g. GIRLY10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 text-xs bg-secondary/40 border border-border rounded-full px-3.5 py-2 text-foreground outline-none focus:border-primary uppercase placeholder:normal-case"
              />
              <button
                onClick={() => {
                  applyCoupon(couponCode);
                  setCouponCode('');
                }}
                className="px-4 py-2 bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground border border-border rounded-full text-xs font-bold transition-all"
              >
                Apply
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs text-muted-foreground pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-foreground">₦{cartSubtotal.toLocaleString()}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-primary font-bold">
                  <span>Discount ({appliedCoupon}):</span>
                  <span>-₦{cartDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Delivery:</span>
                <span className="font-semibold text-primary text-[11px]">
                  Billed by Dispatcher (Distance-Based)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-primary/15 text-[10px] text-muted-foreground leading-snug">
                📍 <strong>Note:</strong> Delivery fee is not fixed — it depends on your location distance and is determined by the dispatcher upon dispatch.
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-foreground border-t border-border pt-1.5">
                <span>Items Total:</span>
                <span className="text-primary font-black">₦{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm py-3.5 shadow-lg shadow-primary/25 transition-all tap-feedback"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
