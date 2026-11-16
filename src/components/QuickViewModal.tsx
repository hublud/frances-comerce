'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useShop } from '../context/ShopContext';
import { X, ShoppingBag, MessageCircle, Star, Heart, Check } from 'lucide-react';
import { ProductVariationType } from '../types';
import { extractColorHex, extractColorName } from '../lib/colors';

export default function QuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    wishlist,
    toggleWishlist,
  } = useShop();

  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Initialize selected variations when product changes
  useEffect(() => {
    if (quickViewProduct) {
      const initial: Record<string, string> = {};
      const variations: ProductVariationType[] = Array.isArray(quickViewProduct.variations)
        ? quickViewProduct.variations
        : [
            {
              name: 'Color',
              options: quickViewProduct.colorVariants && quickViewProduct.colorVariants.length > 0
                ? quickViewProduct.colorVariants
                : ['Blush Pink', 'Rose Quartz', 'Soft Marshmallow'],
            },
            {
              name: 'Size',
              options: ['XS', 'S', 'M', 'L', 'XL'],
            },
          ];

      variations.forEach(v => {
        if (v && v.name && Array.isArray(v.options) && v.options.length > 0) {
          initial[v.name] = v.options[0];
        }
      });

      setSelectedVariations(initial);
      setActiveImageIndex(0);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const handleClose = () => {
    setQuickViewProduct(null);
    setSelectedVariations({});
  };

  const isWished = wishlist.includes(quickViewProduct.id);

  // Get active variations list
  const rawList: ProductVariationType[] = Array.isArray(quickViewProduct.variations)
    ? quickViewProduct.variations
    : [
        {
          name: 'Color',
          options: quickViewProduct.colorVariants && quickViewProduct.colorVariants.length > 0
            ? quickViewProduct.colorVariants
            : ['Blush Pink', 'Rose Quartz', 'Soft Marshmallow'],
        },
        {
          name: 'Size',
          options: ['XS', 'S', 'M', 'L', 'XL'],
        },
      ];
  const variationList: ProductVariationType[] = rawList.filter(
    (v): v is ProductVariationType => Boolean(v && v.name && Array.isArray(v.options))
  );

  const variantSummary = Object.entries(selectedVariations)
    .map(([name, opt]) => `${name}: ${opt}`)
    .join(' · ');

  const isOut = Boolean(quickViewProduct.isOutOfStock) || quickViewProduct.stock <= 0;

  const handleInquireWhatsApp = () => {
    const text = encodeURIComponent(
      isOut
        ? `Hi Frances! 🌸 I am viewing "${quickViewProduct.name}" (₦${quickViewProduct.price.toLocaleString()}) on your website and noticed it is currently Out of Stock.\n• Selected Options: ${variantSummary || 'Standard'}\n\nCould you please let me know when it will be restocked, or can I place a preorder? Thank you! 💕`
        : `Hello Frances! 🌸 Inquiring about "${quickViewProduct.name}" (₦${quickViewProduct.price.toLocaleString()}) from Francielle.\n• Variations: ${variantSummary || 'Standard'}\n`
    );
    window.open(`https://wa.me/2349114336301?text=${text}`, '_blank');
  };

  const imagesToDisplay = quickViewProduct.images && quickViewProduct.images.length > 0
    ? quickViewProduct.images
    : [quickViewProduct.image, quickViewProduct.hoverImage].filter(Boolean) as string[];

  const currentDisplayImage = imagesToDisplay[activeImageIndex] || quickViewProduct.image;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-card rounded-3xl border border-border max-w-2xl w-full p-4 sm:p-7 shadow-2xl z-10 animate-fade-in overflow-hidden my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
          {/* Product Image & Gallery */}
          <div className="flex flex-col gap-2.5">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-secondary shadow-inner">
              <Image
                src={currentDisplayImage}
                alt={quickViewProduct.name}
                fill
                className="object-cover transition-all duration-300"
              />
              {/* Out of stock Badge */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                {isOut && (
                  <span className="rounded-full bg-destructive px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-destructive-foreground shadow">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail switcher if multiple images exist */}
            {imagesToDisplay.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imagesToDisplay.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Variations */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                {quickViewProduct.categoryLabel}
              </span>
            </div>

            <h3 className="font-bold text-lg sm:text-xl text-foreground leading-snug">
              {quickViewProduct.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="flex items-center text-primary">
                <Star className="w-3.5 h-3.5 fill-primary" />
              </div>
              <span className="font-bold text-foreground">{quickViewProduct.rating} / 5.0</span>
              <span>· ({quickViewProduct.reviews} verified reviews)</span>
            </div>

            {/* Price & Stock in Naira ₦ */}
            <div className="flex items-center justify-between mt-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-primary">
                  ₦{quickViewProduct.price.toLocaleString()}
                </span>
                {quickViewProduct.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₦{quickViewProduct.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div>
                {isOut ? (
                  <span className="text-xs font-bold text-destructive inline-flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    Out of stock
                  </span>
                ) : (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    In stock ({quickViewProduct.stock ?? 10})
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {quickViewProduct.description}
            </p>

            {/* DYNAMIC VARIATION SELECTORS (Color, Size, Type, Style, etc.) */}
            <div className="space-y-3 pt-1 border-t border-border mt-1">
              {variationList.map((variation) => {
                const selectedVal = selectedVariations[variation.name] || (variation.options && variation.options[0]) || '';
                return (
                  <div key={variation.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                        {variation.name}:
                      </span>
                      <span className="text-[11px] font-bold text-primary">
                        {selectedVal}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {variation.options.map((opt) => {
                        const isSelected = selectedVal === opt;
                        const isColor = variation.name.toLowerCase().includes('color') || variation.name.toLowerCase().includes('shade');
                        const swatch = isColor ? extractColorHex(opt) : undefined;
                        const label = extractColorName(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              setSelectedVariations(prev => ({
                                ...prev,
                                [variation.name]: opt,
                              }));
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 tap-feedback ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/25 ring-2 ring-primary/20 scale-[1.02]'
                                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary/40'
                            }`}
                          >
                            {swatch && (
                              <span
                                className="w-3 h-3 rounded-full border border-black/15 shadow-2xs inline-block shrink-0"
                                style={{ backgroundColor: swatch }}
                              />
                            )}
                            <span>{label}</span>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Combination Summary */}
            {variantSummary && (
              <div className="px-3 py-1.5 rounded-xl bg-secondary/50 border border-primary/15 text-[11px] text-foreground font-semibold flex items-center justify-between">
                <span>Selected:</span>
                <span className="text-primary font-bold truncate ml-1">{variantSummary}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {isOut ? (
                <>
                  <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/25 text-destructive text-xs leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Currently Out of Stock Online</span>
                    </p>
                    <p className="text-[11px] text-destructive/80 mt-0.5">
                      This item is sold out. Tap below to chat directly with Frances on WhatsApp (09114336301) to check restock dates or place a preorder!
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleInquireWhatsApp}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-emerald-600/30 transition-all tap-feedback"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Inquire Restock / Preorder on WhatsApp</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(quickViewProduct.id)}
                      className={`p-3.5 rounded-full border border-border transition-colors tap-feedback ${
                        isWished ? 'bg-secondary text-primary' : 'bg-background hover:bg-secondary text-foreground'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWished ? 'fill-primary' : ''}`} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        addToCart(quickViewProduct.id, 1, variantSummary, selectedVariations);
                        handleClose();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:shadow-primary/30 transition-all tap-feedback"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(quickViewProduct.id)}
                      className={`p-3 rounded-full border border-border transition-colors tap-feedback ${
                        isWished ? 'bg-secondary text-primary' : 'bg-background hover:bg-secondary text-foreground'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWished ? 'fill-primary' : ''}`} />
                    </button>
                  </div>

                  <button
                    onClick={handleInquireWhatsApp}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/70 border border-primary/20 text-foreground text-xs font-bold transition-all tap-feedback"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-primary" />
                    <span>Inquire on WhatsApp (09114336301)</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
