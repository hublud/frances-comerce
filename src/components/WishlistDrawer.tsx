'use client';

import React from 'react';
import SafeImage from './SafeImage';
import { useShop } from '../context/ShopContext';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistDrawer() {
  const {
    products,
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart,
  } = useShop();

  if (!isWishlistOpen) return null;

  const wishedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="absolute inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto max-h-[90vh] md:max-h-full w-full md:max-w-md bg-card rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none shadow-2xl flex flex-col overflow-hidden animate-slide-up border-l border-border">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-primary text-primary" />
            <h3 className="font-bold text-base sm:text-lg text-foreground">
              Saved Wishlist ({wishedProducts.length})
            </h3>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary"
            aria-label="Close Wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-border">
          {wishedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-2">💗</div>
              <h4 className="text-base font-bold text-foreground mb-1">
                Your wishlist is empty
              </h4>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                Tap the heart on any product to save it here for later.
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            wishedProducts.map((item) => (
              <div key={item.id} className="py-3.5 flex gap-3 first:pt-0">
                <div className="relative w-18 h-18 rounded-xl overflow-hidden border border-border bg-secondary shrink-0">
                  <SafeImage src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{item.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{item.categoryLabel}</p>
                    </div>
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      ₦{item.price.toLocaleString()}
                    </span>

                    <button
                      onClick={() => addToCart(item.id, 1)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all tap-feedback"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
