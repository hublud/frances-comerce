'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';

export default function Footer() {
  const { setActiveCategory } = useShop();

  const handleNav = (cat: CategoryType) => {
    setActiveCategory(cat);
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full overflow-hidden border-t border-foreground/10 bg-foreground text-background">
      {/* Subtle Background Typography Watermark Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
      >
        <div className="flex h-full w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 p-6 text-center font-black uppercase tracking-tighter leading-none">
          <span className="text-5xl">ORDERS</span>
          <span className="text-3xl text-primary">LEADING</span>
          <span className="text-2xl">CYBER SHOPPING</span>
          <span className="text-4xl">CART</span>
          <span className="text-3xl text-primary">LIFESTYLE</span>
          <span className="text-2xl">DAILY</span>
          <span className="text-4xl">DELIVERING</span>
          <span className="text-2xl text-primary">PREMIUM</span>
          <span className="text-3xl">CUSTOMER</span>
          <span className="text-2xl">SEAMLESS</span>
          <span className="text-3xl text-primary">CURATED</span>
          <span className="text-2xl">LOGISTICS</span>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14">
        {/* Brand Header */}
        <div className="mb-10 flex flex-col items-center gap-2 border-b border-background/10 pb-10 text-center">
          <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-primary/40 bg-white shadow-sm flex items-center justify-center shrink-0">
            <Image
              src="/assets/images/logo.jpeg"
              alt="Francielle By Frances Logo"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-center mt-1">
            <h2 className="font-black uppercase tracking-[0.2em] text-2xl sm:text-3xl text-background leading-none">
              FRANCI<span className="text-primary">ELLE</span>
              <span className="align-super text-xs text-background/60 ml-0.5">®</span>
            </h2>
            <span className="text-xs font-bold tracking-[0.35em] text-primary uppercase mt-1">
              BY FRANCES
            </span>
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mt-1">
            Speed Shopping · Fast Nationwide Delivery Across Nigeria
          </p>
        </div>

        {/* 3 Column Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Column 1: The Brand */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
              The Brand
            </h4>
            <p className="text-sm text-background/70 leading-relaxed">
              Francielle By Frances · A Little World of Lovely Things. Girly phone cases, beauty essentials, cute key holders &amp; charms, and classy lifestyle pieces — all hand-curated for you in Nigeria.
            </p>
            <div className="flex items-center gap-2 text-sm text-background/70 pt-1">
              <Heart className="size-4 fill-primary text-primary" />
              <span>Made with love for every classy girly soul</span>
            </div>
          </div>

          {/* Column 2: Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Contact &amp; Orders
            </h4>
            <a
              href="https://wa.me/2349114336301"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-background/80 transition-colors hover:text-primary"
            >
              <Phone className="size-4 text-primary" />
              <span>+234 911 433 6301 (WhatsApp)</span>
            </a>
            <a
              href="tel:09114336301"
              className="flex items-center gap-2 text-sm text-background/80 transition-colors hover:text-primary"
            >
              <Phone className="size-4 text-primary" />
              <span>09114336301</span>
            </a>
            <div className="flex items-start gap-2 text-sm text-background/80">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>Kaduna, Nigeria · Delivering Nationwide</span>
            </div>
          </div>

          {/* Column 3: Shop Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Shop Collections
            </h4>
            <button
              onClick={() => handleNav('all')}
              className="text-left text-sm text-background/80 transition-colors hover:text-primary"
            >
              All Lovely Things
            </button>
            <button
              onClick={() => handleNav('cases')}
              className="text-left text-sm text-background/80 transition-colors hover:text-primary"
            >
              Phone Cases
            </button>
            <button
              onClick={() => handleNav('beauty')}
              className="text-left text-sm text-background/80 transition-colors hover:text-primary"
            >
              Beauty &amp; Glam
            </button>
            <button
              onClick={() => handleNav('accessories')}
              className="text-left text-sm text-background/80 transition-colors hover:text-primary"
            >
              Girly Accessories
            </button>
            <button
              onClick={() => handleNav('lifestyle')}
              className="text-left text-sm text-background/80 transition-colors hover:text-primary"
            >
              Classy Lifestyle
            </button>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-background/10 pt-6 sm:flex-row">
          <p className="text-[11px] uppercase tracking-[0.3em] text-background/50">
            © 2026 Francielle By Frances · A Little World of Lovely Things
          </p>
          <p className="text-[11px] uppercase tracking-[0.3em] text-background/50">
            Nigeria Delivery · Fast Orders
          </p>
        </div>
      </div>
    </footer>
  );
}
