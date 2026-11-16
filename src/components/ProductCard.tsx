'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { Heart, ShoppingBag, Eye, MessageCircle, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const BADGE_MAP: Record<string, { label: string; className: string }> = {
  flash: { label: '🔥 Flash Sale', className: 'bg-destructive text-destructive-foreground' },
  best: { label: '⭐ Best Seller', className: 'bg-primary text-primary-foreground' },
  trending: { label: '🚀 Trending', className: 'bg-accent text-accent-foreground' },
  new: { label: '🆕 New', className: 'bg-foreground text-background' },
  limited: { label: '⚡ Limited', className: 'bg-secondary text-secondary-foreground border border-primary/30' },
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, wishlist, toggleWishlist, setQuickViewProduct } = useShop();
  const [isHovered, setIsHovered] = useState(false);
  const [touchActive, setTouchActive] = useState(false);
  const [isJustAdded, setIsJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, 1);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1300);
  };

  const isWished = wishlist.includes(product.id);
  const isOut = Boolean(product.isOutOfStock) || product.stock <= 0;

  const displayImage = isHovered && product.hoverImage ? product.hoverImage : product.image;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setTouchActive(false);
      }}
    >
      {/* Product Image Stage - Clicking opens Product Quick View */}
      <div
        onClick={() => setQuickViewProduct(product)}
        className="relative aspect-square overflow-hidden bg-secondary select-none cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setQuickViewProduct(product);
          }
        }}
        aria-label={`View ${product.name} details`}
      >
        <Image
          src={displayImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Out of Stock Badge */}
        {isOut && (
          <span className="absolute left-2 top-2 rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow z-10">
            Out of stock
          </span>
        )}

        {/* Feature Tag Badges */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1 pointer-events-none">
          {product.badges && product.badges.map((badgeKey) => {
            const badge = BADGE_MAP[badgeKey];
            if (!badge) return null;
            return (
              <span
                key={badgeKey}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold shadow-xs ${badge.className}`}
              >
                {badge.label}
              </span>
            );
          })}
        </div>

        {/* Quick View Eye Button - ALWAYS VISIBLE on Mobile & Desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product);
          }}
          aria-label="View product details and options"
          className="absolute bottom-2 left-2 grid size-8 sm:size-9 place-items-center rounded-full bg-background/90 text-foreground shadow backdrop-blur transition hover:scale-110 hover:text-primary z-10 tap-feedback border border-primary/10"
        >
          <Eye className="size-4 text-primary" />
        </button>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="Toggle wishlist"
          className="absolute bottom-2 right-2 grid size-8 sm:size-9 place-items-center rounded-full bg-background/90 shadow backdrop-blur transition hover:scale-110 z-10 tap-feedback border border-primary/10"
        >
          <Heart
            className={`size-4 transition-colors ${
              isWished ? 'fill-primary text-primary' : 'text-foreground hover:text-primary'
            }`}
          />
        </button>

        {/* Quick View Pill (Desktop Hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product);
          }}
          className={`hidden sm:flex absolute inset-x-2 bottom-2 mx-auto w-fit items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-semibold text-background shadow-md backdrop-blur transition-all duration-200 z-10 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <Eye className="size-3.5" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Title */}
        <h3
          onClick={() => setQuickViewProduct(product)}
          className="line-clamp-1 text-xs sm:text-sm font-semibold text-foreground hover:text-primary cursor-pointer transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Price in Naira ₦ */}
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-sm sm:text-base font-bold text-primary">
            ₦{product.price.toLocaleString()}
          </span>
        </div>

        {/* Add to Bag CTA or Out of Stock WhatsApp Inquiry */}
        {isOut ? (
          <a
            href={`https://wa.me/2349114336301?text=${encodeURIComponent(
              `Hi Frances! 🌸 I saw the "${product.name}" on your shop (https://francielle.ng) and noticed it's currently Out of Stock.\n\nCould you please let me know when it will be restocked or if I can place a preorder? Thank you! 💕`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 sm:py-2.5 shadow-sm hover:shadow-md transition-all tap-feedback"
            title="Inquire about restock on WhatsApp"
          >
            <MessageCircle className="size-3.5" />
            <span>Inquire on WhatsApp</span>
          </a>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-full font-bold text-xs py-2 sm:py-2.5 shadow-sm transition-all duration-300 tap-feedback ${
              isJustAdded
                ? 'bg-emerald-600 text-white scale-[1.02] shadow-md ring-2 ring-emerald-400/40'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md hover:shadow-primary/20'
            }`}
          >
            {isJustAdded ? (
              <>
                <Check className="size-3.5 animate-bounce" />
                <span>Added to Bag! 💗</span>
              </>
            ) : (
              <>
                <ShoppingBag className="size-3.5" />
                <span>Add to cart</span>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
