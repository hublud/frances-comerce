'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useShop } from '../context/ShopContext';
import { Search, Heart, ShoppingBag, Sparkles, Phone, Star, X, Truck } from 'lucide-react';

export default function Header() {
  const {
    products,
    cartTotalCount,
    cartAnimationTrigger,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    searchQuery,
    setSearchQuery,
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    setQuickViewProduct,
  } = useShop();

  const [isCartBouncing, setIsCartBouncing] = useState(false);

  React.useEffect(() => {
    if (cartAnimationTrigger > 0) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 900);
      return () => clearTimeout(timer);
    }
  }, [cartAnimationTrigger]);

  // Filtered search results from active product catalog
  const searchMatches = searchQuery.trim().length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  return (
    <>
      {/* 1. Announcement Bar */}
      <div className="sticky top-0 z-50 w-full max-w-full bg-secondary text-foreground text-xs sm:text-sm border-b border-primary/15 overflow-hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 px-3 py-1.5 sm:py-2">
          {/* Left: Top Rated badge (Desktop only) */}
          <div className="hidden sm:flex items-center gap-1.5 font-semibold tracking-wide shrink-0">
            <span className="flex items-center gap-1 text-primary font-bold">
              <Sparkles className="w-3.5 h-3.5" /> TOP RATED
            </span>
            <span className="opacity-50">·</span>
            <span className="font-semibold">TODAY ONLY</span>
          </div>

          {/* Center: Brand tagline (Desktop only) */}
          <div className="hidden md:flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <span>FRANCIELLE BY FRANCES · A LITTLE WORLD OF LOVELY THINGS</span>
          </div>

          {/* Right: Phone & WhatsApp contact numbers (Desktop only) */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 font-semibold shrink-0 text-xs sm:text-sm">
            <a
              href="https://wa.me/2349114336301?text=Hello%20Frances!%20🌸%20I%20am%20visiting%20your%20shop%20and%20would%20like%20to%20place%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition-colors whitespace-nowrap text-xs text-foreground font-bold tap-feedback"
              title="Chat on WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-emerald-600 shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>0911 433 6301</span>
            </a>
            <a
              href="tel:09114336301"
              className="p-1 text-primary hover:text-primary/80 transition-colors"
              title="Call 09114336301"
              aria-label="Direct Phone Call"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
            </a>
            <span className="opacity-40">|</span>
            <span className="text-xs font-semibold text-muted-foreground">
              🇳🇬 Fast Delivery
            </span>
          </div>

          {/* Mobile Announcement: No TOP RATED, replaced with interactive WhatsApp & Call bar */}
          <div className="flex sm:hidden items-center justify-center w-full gap-2 text-xs font-semibold">
            <span className="text-[11px] text-muted-foreground font-bold">Chat on WhatsApp:</span>
            <div className="flex items-center gap-1.5 bg-background/90 px-3 py-1 rounded-full border border-primary/25 shadow-xs">
              <a
                href="https://wa.me/2349114336301?text=Hello%20Frances!%20🌸%20I%20am%20visiting%20your%20shop%20and%20would%20like%20to%20place%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-extrabold hover:underline tap-feedback"
                title="Tap to chat on WhatsApp"
              >
                <svg className="w-3.5 h-3.5 fill-emerald-600 shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>0911 433 6301</span>
              </a>
              <span className="text-border">·</span>
              <a
                href="tel:09114336301"
                className="p-1 text-primary hover:text-primary/80 transition-colors tap-feedback"
                title="Direct Phone Call"
                aria-label="Direct Phone Call"
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <header className="sticky top-[36px] z-40 w-full max-w-full border-b border-border bg-background shadow-sm overflow-hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3">
          
          {/* Brand Logo & Name with "BY FRANCES" underneath */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative h-11 w-11 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-sm transition-transform group-hover:scale-105 bg-white flex items-center justify-center shrink-0">
              <Image
                src="/assets/images/logo.jpeg"
                alt="Francielle By Frances Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black uppercase tracking-wider text-foreground text-base sm:text-xl leading-none">
                FRANCI<span className="text-primary">ELLE</span>
                <span className="align-super text-[9px] text-muted-foreground ml-0.5">®</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-[0.25em] text-primary/80 uppercase mt-0.5 leading-none">
                BY FRANCES
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="search"
                aria-label="Search products"
                placeholder="Search phone cases, lip glosses, bow grips, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-full border border-border bg-secondary/40 pl-5 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/15 transition shadow-inner"
              />
              <button
                aria-label="Search"
                onClick={() => {
                  const shop = document.getElementById('products');
                  if (shop) shop.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm tap-feedback"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Desktop Autocomplete */}
              {searchMatches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 p-2 animate-fade-in">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
                    Matching Products
                  </p>
                  {searchMatches.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setQuickViewProduct(item);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-secondary/60 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border bg-secondary">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                        <p className="text-[11px] font-semibold text-primary">
                          ₦{item.price.toLocaleString()} · <span className="text-muted-foreground">{item.categoryLabel}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 text-foreground hover:bg-secondary rounded-full md:hidden transition-colors"
              aria-label="Search items"
            >
              <Search className="w-5 h-5 text-primary" />
            </button>

            {/* Fast Delivery Link - Desktop Only (Mobile uses bottom nav) */}
            <a
              href="#delivery"
              className="relative hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary transition-colors text-foreground font-semibold text-xs sm:text-sm tap-feedback"
            >
              <Truck className="w-4 h-4 text-primary" />
              <span className="hidden lg:inline">Fast Delivery</span>
            </a>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-secondary transition-colors text-foreground font-semibold text-xs sm:text-sm tap-feedback"
              aria-label="Open Wishlist"
            >
              <Heart className="w-5 h-5 text-primary" />
              <span className="hidden lg:inline">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button with Animated Bounce Counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary transition-all duration-300 text-foreground font-semibold text-xs sm:text-sm tap-feedback border border-primary/20 ${
                isCartBouncing ? 'scale-110 ring-2 ring-primary bg-primary/10 shadow-md shadow-primary/25' : ''
              }`}
              aria-label="Open Cart"
            >
              <ShoppingBag className={`w-5 h-5 text-primary transition-transform duration-300 ${isCartBouncing ? 'animate-bounce text-pink-600 scale-125' : ''}`} />
              <span className="hidden lg:inline">Cart</span>
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-black text-primary-foreground shadow-sm transition-all duration-300 ${
                  isCartBouncing ? 'scale-125 bg-pink-600 ring-2 ring-white shadow-md' : ''
                }`}
              >
                {cartTotalCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Drawer */}
        {isMobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 pt-1 border-t border-border bg-background animate-fade-in">
            <div className="flex items-center bg-secondary/50 border border-border rounded-full px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsMobileSearchOpen(false);
                }}
                className="text-muted-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {searchMatches.length > 0 && (
              <div className="mt-2 bg-card border border-border rounded-xl divide-y divide-border/40 shadow-lg overflow-hidden">
                {searchMatches.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setQuickViewProduct(item);
                      setIsMobileSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-2.5 p-2 hover:bg-secondary/40"
                  >
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-border bg-secondary">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] font-semibold text-primary">₦{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
