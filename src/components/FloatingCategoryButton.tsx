'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useShop } from '../context/ShopContext';
import { SlidersHorizontal, Sparkles, Smartphone, Key, Gift, ChevronUp } from 'lucide-react';

export default function FloatingCategoryButton() {
  const pathname = usePathname();
  const {
    products,
    activeCategory,
    setIsCategoryDrawerOpen,
  } = useShop();

  // Hide floating category icon on admin pages (login & dashboard)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const [isVisible, setIsVisible] = useState(true);

  // Label configuration based on active category
  const categoryLabels: Record<string, { label: string; icon: string }> = {
    all: { label: 'Categories', icon: '✨' },
    cases: { label: 'Phone Cases', icon: '📱' },
    beauty: { label: 'Beauty', icon: '💄' },
    accessories: { label: 'Girly Accessories', icon: '🎀' },
    lifestyle: { label: 'Lifestyle', icon: '🎁' },
  };

  const current = categoryLabels[activeCategory] || { label: 'Categories', icon: '✨' };
  const count = activeCategory === 'all'
    ? products.length
    : products.filter(p => p.category === activeCategory).length;

  return (
    <aside aria-label="Floating Category Filter" className="hidden md:block fixed bottom-22 right-6 md:right-8 z-40">
      <button
        onClick={() => setIsCategoryDrawerOpen(true)}
        className="group relative flex items-center gap-2 pl-3.5 pr-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-primary via-primary/95 to-destructive text-primary-foreground font-black text-xs sm:text-sm shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 border border-white/25 hover:scale-105 active:scale-95 transition-all duration-300 tap-feedback backdrop-blur-md"
        title="Open Category Filter Drawer"
        aria-label="Filter products by category"
      >
        {/* Glow halo */}
        <span className="absolute -inset-1 rounded-full bg-primary/20 blur-sm pointer-events-none group-hover:bg-primary/30 transition-all" />

        {/* Icon & Sparkle badge */}
        <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-white shadow-xs">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </span>

        {/* Current Category Label */}
        <span className="relative flex items-center gap-1.5 tracking-tight">
          <span className="text-sm">{current.icon}</span>
          <span className="font-extrabold">{current.label}</span>
        </span>

        {/* Little Drawer indicator */}
        <ChevronUp className="w-3.5 h-3.5 text-white/80 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </aside>
  );
}

