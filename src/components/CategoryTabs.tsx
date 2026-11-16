'use client';

import React from 'react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
import {
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Key,
  Gift,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface CatItem {
  id: CategoryType;
  label: string;
  shortLabel: string;
  iconName: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CatItem[] = [
  { id: 'all', label: 'All Lovely Things', shortLabel: 'All', iconName: '✨', Icon: SlidersHorizontal },
  { id: 'cases', label: 'Phone Cases & Tech Glam', shortLabel: 'Phone Cases', iconName: '📱', Icon: Smartphone },
  { id: 'beauty', label: 'Beauty & Glam Essentials', shortLabel: 'Beauty Essentials', iconName: '💄', Icon: Sparkles },
  { id: 'accessories', label: 'Girly Accessories', shortLabel: 'Girly Accessories', iconName: '🎀', Icon: Key },
  { id: 'lifestyle', label: 'Classy Lifestyle & Gifting', shortLabel: 'Lifestyle & Gifts', iconName: '🎁', Icon: Gift },
];

export default function CategoryTabs() {
  const {
    products,
    activeCategory,
    setActiveCategory,
    setIsCategoryDrawerOpen,
    showToast,
  } = useShop();

  const handleSelect = (cat: CategoryType, label: string) => {
    setActiveCategory(cat);
    showToast(cat === 'all' ? 'Browsing all lovely items 🌸' : `Selected ${label} ✨`, 'sparkle');

    const shopSection = document.getElementById('products');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  const getCount = (id: CategoryType) => {
    if (id === 'all') return products.length;
    return products.filter(p => p.category === id).length;
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-[60px] sm:top-[68px] z-30 shadow-xs w-full max-w-full">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Category Modal Trigger and Desktop Chips */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
            
            {/* 1. CATEGORY MODAL TRIGGER (Full width on mobile, auto on desktop) */}
            <div className="relative w-full sm:w-auto shrink-0 sm:shrink">
              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(true)}
                className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2.5 rounded-full px-4 h-9 sm:h-10 text-xs sm:text-sm font-black transition-all shadow-sm tap-feedback ${
                  activeCategory !== 'all'
                    ? 'bg-primary text-primary-foreground shadow-primary/25 ring-2 ring-primary/20'
                    : 'bg-secondary text-foreground hover:bg-primary/15'
                }`}
                aria-label="Open Categories Modal"
                title="Open Category Explorer Modal"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {activeCategory === 'all' ? 'All Categories' : currentCategory.shortLabel}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform duration-200" />
              </button>
            </div>

            {/* Vertical separator (Desktop only) */}
            <span className="h-5 w-px bg-border shrink-0 hidden sm:inline-block" />

            {/* 2. HORIZONTAL CATEGORY CHIPS (Desktop only - slider removed on mobile) */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none py-1 flex-1">
              {CATEGORIES.slice(1).map(({ id, shortLabel, Icon }) => {
                const isActive = activeCategory === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelect(id, shortLabel)}
                    className={`shrink-0 inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-4 h-9 sm:h-10 text-xs sm:text-sm font-semibold transition-all tap-feedback ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30 font-bold'
                        : 'bg-card text-foreground border border-border hover:border-primary/40 hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                    <span>{shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. QUICK DRAWER ICON TRIGGER (RIGHT FLANK - Desktop only) */}
          <button
            onClick={() => setIsCategoryDrawerOpen(true)}
            className="hidden sm:inline-flex shrink-0 p-2 sm:px-3 sm:py-2 rounded-full bg-secondary/80 hover:bg-secondary text-primary hover:text-foreground text-xs font-bold transition-all border border-primary/20 items-center gap-1.5 shadow-xs tap-feedback"
            title="Open Category Filter Drawer"
            aria-label="Open Category Filter Drawer"
          >
            <Layers className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Drawer</span>
          </button>

        </div>
      </div>
    </nav>
  );
}
