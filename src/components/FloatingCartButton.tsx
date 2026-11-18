'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

export default function FloatingCartButton() {
  const pathname = usePathname();
  const {
    cartTotalCount,
    cartSubtotal,
    cartAnimationTrigger,
    setIsCartOpen,
    setIsCheckoutOpen,
    isCartOpen,
    isCheckoutOpen,
  } = useShop();

  const [isBouncing, setIsBouncing] = useState(false);

  // Trigger bounce animation whenever items are added
  useEffect(() => {
    if (cartAnimationTrigger > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 900);
      return () => clearTimeout(timer);
    }
  }, [cartAnimationTrigger]);

  // Hide on admin pages or when checkout/cart is already open
  if (pathname?.startsWith('/admin') || isCheckoutOpen || isCartOpen) {
    return null;
  }

  const hasItems = cartTotalCount > 0;

  return (
    <aside
      aria-label="Floating Bag & Checkout Button"
      className="hidden md:flex fixed bottom-8 right-6 md:right-8 z-40 items-center gap-2"
    >
      <div
        className={`group relative flex items-center rounded-full shadow-2xl transition-all duration-300 ${
          hasItems
            ? 'bg-gradient-to-r from-primary via-pink-600 to-primary text-primary-foreground p-1 hover:scale-105 active:scale-95 shadow-primary/30 hover:shadow-primary/50 ring-2 ring-primary/30'
            : 'bg-card text-foreground hover:bg-secondary/80 border border-border p-1.5 hover:scale-105 active:scale-95 shadow-md'
        }`}
      >
        {/* Glow halo when items exist */}
        {hasItems && (
          <span className="absolute -inset-1 rounded-full bg-primary/25 blur-md pointer-events-none group-hover:bg-primary/40 transition-all animate-pulse" />
        )}

        {/* Left Section: Bag Icon & Item Counter (Opens Cart Drawer to review) */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-full transition-all tap-feedback cursor-pointer ${
            hasItems
              ? 'hover:bg-white/15 text-primary-foreground'
              : 'text-foreground hover:text-primary'
          }`}
          title="View Bag & Order Details"
          aria-label={`View shopping bag (${cartTotalCount} items)`}
        >
          <div className="relative">
            <ShoppingBag
              className={`w-5 h-5 transition-transform duration-300 ${
                isBouncing ? 'animate-bounce scale-125 text-white' : ''
              }`}
            />
            {hasItems && (
              <span
                className={`absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-white text-primary text-[10px] font-black px-1 shadow-sm transition-transform ${
                  isBouncing ? 'scale-125 animate-pulse' : ''
                }`}
              >
                {cartTotalCount}
              </span>
            )}
          </div>

          <div className="flex flex-col text-left leading-tight pr-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <span>Bag</span>
              {hasItems && <span className="opacity-80">({cartTotalCount})</span>}
            </span>
            {hasItems && (
              <span className="text-xs font-black tracking-tight">
                ₦{cartSubtotal.toLocaleString()}
              </span>
            )}
          </div>
        </button>

        {/* Right Section: Direct 1-Click Checkout Button (Visible when bag has items) */}
        {hasItems && (
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="flex items-center gap-1.5 pl-3.5 pr-4 py-2 rounded-full bg-white text-primary hover:bg-white/95 font-black text-xs shadow-md transition-all tap-feedback cursor-pointer group/btn ml-1 hover:pr-4.5"
            title="Proceed Directly to Checkout"
            aria-label="Proceed to checkout"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform stroke-[2.5]" />
          </button>
        )}
      </div>
    </aside>
  );
}
