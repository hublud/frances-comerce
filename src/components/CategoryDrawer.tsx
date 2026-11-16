'use client';

import React from 'react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
import {
  X,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Key,
  Gift,
  Check,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

interface CategoryOption {
  id: CategoryType;
  name: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const CATEGORY_LIST: CategoryOption[] = [
  {
    id: 'all',
    name: 'All Lovely Things',
    subtitle: 'Browse our entire girly catalog in one place',
    Icon: SlidersHorizontal,
    tag: 'Full Catalog',
  },
  {
    id: 'cases',
    name: 'Phone Cases & Tech Glam',
    subtitle: 'Chic wave rims, pearl wristlets & mirror selfie cases for iPhone 13-16',
    Icon: Smartphone,
    tag: 'Trending',
  },
  {
    id: 'beauty',
    name: 'Beauty & Glam Essentials',
    subtitle: 'Plumping lip glow oils, glosses & vanity essentials',
    Icon: Sparkles,
    tag: 'Glow Up',
  },
  {
    id: 'accessories',
    name: 'Girly Accessories',
    subtitle: 'Pearl bow charms, crystal keyrings & classy trinkets',
    Icon: Key,
    tag: 'Must-Have',
  },
  {
    id: 'lifestyle',
    name: 'Classy Lifestyle & Gifting',
    subtitle: 'Aesthetic cups, room lifestyle pieces & thoughtful gifts',
    Icon: Gift,
    tag: 'Classy',
  },
];

export default function CategoryDrawer() {
  const {
    products,
    activeCategory,
    setActiveCategory,
    isCategoryDrawerOpen,
    setIsCategoryDrawerOpen,
    showToast,
  } = useShop();

  if (!isCategoryDrawerOpen) return null;

  const handleSelectCategory = (cat: CategoryType, label: string) => {
    setActiveCategory(cat);
    setIsCategoryDrawerOpen(false);
    showToast(cat === 'all' ? 'Showing all products 🌸' : `Filtered to ${label} ✨`, 'sparkle');

    // Smooth scroll down to products
    const section = document.getElementById('products');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getProductCount = (catId: CategoryType): number => {
    if (catId === 'all') return products.length;
    return products.filter(p => p.category === catId).length;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCategoryDrawerOpen(false)}
        className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity animate-fade-in"
        aria-hidden="true"
      />

      {/* Drawer / Bottom Sheet Container */}
      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:max-w-md w-full flex flex-col justify-end md:justify-center pointer-events-none">
        <div className="pointer-events-auto bg-card border-t md:border-l md:border-t-0 border-primary/25 rounded-t-[32px] md:rounded-t-none md:rounded-l-[32px] shadow-2xl p-5 sm:p-6 max-h-[85vh] md:max-h-screen md:h-full flex flex-col justify-between overflow-hidden animate-slide-up md:animate-slide-left">
          
          {/* Mobile Handle Bar */}
          <div className="md:hidden flex justify-center pb-2">
            <span className="w-12 h-1.5 rounded-full bg-border" />
          </div>

          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-secondary text-primary flex items-center justify-center shadow-xs">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-1.5 leading-snug">
                  <span>Categories &amp; Filter</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Girly Shop
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tap any category to instantly filter products
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCategoryDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close category filter"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Cards List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-2.5 scrollbar-none">
            {CATEGORY_LIST.map(({ id, name, subtitle, Icon, tag }) => {
              const isSelected = activeCategory === id;
              const count = getProductCount(id);

              return (
                <button
                  key={id}
                  onClick={() => handleSelectCategory(id, name)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 group tap-feedback ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-sm shadow-primary/10 ring-1 ring-primary/30'
                      : 'bg-card hover:bg-secondary/40 border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-primary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {name}
                        </span>
                        {tag && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-primary shrink-0 hidden sm:inline-block">
                            {tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5 leading-tight">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Drawer Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center gap-2.5">
            <button
              onClick={() => handleSelectCategory('all', 'All Products')}
              className="flex-1 py-3 rounded-2xl bg-secondary hover:bg-secondary/70 text-foreground text-xs font-bold transition-all border border-primary/20 text-center"
            >
              Reset to All
            </button>

            <button
              onClick={() => {
                setIsCategoryDrawerOpen(false);
                const section = document.getElementById('products');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

