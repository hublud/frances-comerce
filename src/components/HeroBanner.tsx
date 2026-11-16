'use client';

import React from 'react';
import Image from 'next/image';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
import {
  Sparkles,
  Heart,
  ArrowRight,
  Menu,
  Smartphone,
  Sparkle,
  Key,
  Gift,
  Truck,
  BadgeCheck,
  RotateCcw,
} from 'lucide-react';

interface HeroCategory {
  id: CategoryType;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const HERO_CATEGORIES: HeroCategory[] = [
  { id: 'all', label: 'All', Icon: Menu },
  { id: 'cases', label: 'Phone Cases', Icon: Smartphone },
  { id: 'beauty', label: 'Beauty & Glam', Icon: Sparkle },
  { id: 'accessories', label: 'Girly Accessories', Icon: Key },
  { id: 'lifestyle', label: 'Classy Lifestyle', Icon: Gift },
];

export default function HeroBanner() {
  const { activeCategory, setActiveCategory } = useShop();

  const handleCategoryClick = (cat: CategoryType) => {
    setActiveCategory(cat);
    const shop = document.getElementById('products');
    if (shop) {
      shop.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToShop = () => {
    const shop = document.getElementById('products');
    if (shop) {
      shop.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 pt-3 sm:pt-4 w-full max-w-full overflow-hidden">
      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary via-background to-secondary/60 shadow-sm w-full">
        {/* Floating Ambient Heart & Sparkles */}
        <Heart
          aria-hidden="true"
          className="pointer-events-none absolute left-[42%] top-10 size-10 text-primary/30 fill-primary/10 animate-pulse"
        />
        <Sparkles
          aria-hidden="true"
          className="pointer-events-none absolute left-[34%] top-6 size-5 text-primary/50"
        />
        <Sparkles
          aria-hidden="true"
          className="pointer-events-none absolute right-[34%] bottom-10 size-4 text-primary/40"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 px-6 py-8 md:px-12 md:py-14">
          
          {/* Left Column: Headlines & CTA */}
          <div className="md:col-span-6 lg:col-span-5 relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              <span>A Little World of Lovely Things</span>
            </p>

            <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground">
              A Little World of<br />
              Lovely <span className="text-primary">Things</span>
            </h1>

            <p className="mt-5 text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
              Girly phone cases, beauty essentials, classy key holders, and timeless accessories — all thoughtfully curated to make a girl look and feel classy.
            </p>

            {/* SHOP NOW Button */}
            <div className="mt-7">
              <button
                onClick={scrollToShop}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm cursor-pointer hover:shadow-xl hover:shadow-primary/30 transition-all rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide px-7 h-12 shadow-lg shadow-primary/30 group tap-feedback"
              >
                <span>SHOP LOVELY PIECES</span>
                <span className="ml-2 grid size-7 place-items-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="size-4" />
                </span>
              </button>
            </div>

            {/* Shop by category pill row */}
            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Shop by category
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x no-scrollbar">
                {HERO_CATEGORIES.map(({ id, label, Icon }) => {
                  const isActive = activeCategory === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleCategoryClick(id)}
                      className={`snap-start shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 h-9 text-xs font-semibold transition-all border tap-feedback ${
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30'
                          : 'bg-background/70 text-foreground border-primary/15 hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      <Icon className="size-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Column: Circular Showcase Badge */}
          <div className="hidden md:block md:col-span-6 lg:col-span-5 relative">
            <div className="relative mx-auto aspect-square w-full max-w-md">
              {/* Soft Pink Glow Backdrop */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/30 via-primary/15 to-transparent blur-2xl" />
              
              {/* Circle Wrapper */}
              <div className="relative h-full w-full overflow-hidden rounded-full ring-2 ring-primary/25 shadow-2xl shadow-primary/20 bg-secondary">
                <Image
                  src="/assets/images/hero-thankyou.jpg"
                  alt="Thank You for shopping with Francielle by Frances"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Column: 3 Feature Badges */}
          <div className="hidden lg:flex md:col-span-12 lg:col-span-2 flex-col gap-4 justify-start">
            {/* 1. Fast Delivery */}
            <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-background/80 backdrop-blur px-3 py-2.5 shadow-sm min-w-[155px] hover:border-primary/30 transition-colors">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                <Truck className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-bold text-foreground">Fast Delivery</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Across Nigeria</p>
              </div>
            </div>

            {/* 2. Top Quality */}
            <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-background/80 backdrop-blur px-3 py-2.5 shadow-sm min-w-[155px] hover:border-primary/30 transition-colors">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                <BadgeCheck className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-bold text-foreground">Top Quality</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Premium Products</p>
              </div>
            </div>

            {/* 3. Easy Returns */}
            <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-background/80 backdrop-blur px-3 py-2.5 shadow-sm min-w-[155px] hover:border-primary/30 transition-colors">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                <RotateCcw className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-bold text-foreground">Easy Returns</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Hassle Free</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
