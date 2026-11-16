'use client';

import React from 'react';
import { Truck, BadgeCheck, RotateCcw, MessageCircle, ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function FastDeliveryShowcase() {
  const deliveryPoints = [
    {
      icon: Truck,
      title: 'Fast Delivery',
      subtitle: 'Across Nigeria promptly',
      detail: 'Delivery within Kaduna takes 24–48 hours; delivery outside Kaduna takes 3–4 days across Nigeria. Note: Delivery fee is not fixed — it depends on distance and the fee raised by the dispatcher upon dispatch.',
      tag: 'Express Dispatch',
    },
    {
      icon: BadgeCheck,
      title: 'Top Quality',
      subtitle: '100% Curated premium items',
      detail: 'Every single piece is hand-inspected, exquisitely packaged, and crafted from high-grade fabrics, pearls, and materials.',
      tag: 'Quality Guaranteed',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      subtitle: 'Hassle-free guarantee',
      detail: 'Not completely in love? Enjoy our seamless, no-stress 7-day exchange and return policy on eligible unworn items.',
      tag: '7-Day Policy',
    },
    {
      icon: MessageCircle,
      title: 'Instant Support',
      subtitle: 'Direct WhatsApp assistance',
      detail: 'Chat directly with Frances and our team on WhatsApp for instant sizing help, product photos, and order tracking.',
      tag: '09114336301',
    },
  ];

  return (
    <section id="delivery" className="border-t border-border bg-gradient-to-b from-secondary/40 via-background to-secondary/30 py-12 sm:py-16 w-full max-w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Truck className="size-3.5" />
            <span>Nationwide Delivery · Nigeria</span>
          </div>
          <h2 className="text-3xl font-black text-foreground md:text-4xl tracking-tight">
            Fast Delivery &amp; <span className="text-primary italic">Guaranteed Quality</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Shop your favorite girly essentials with complete confidence. Every Francielle order is treated like a special gift from us to you.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {deliveryPoints.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40"
              >
                <div>
                  {/* Icon & Badge Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary transition-transform group-hover:scale-110 shadow-xs">
                      <Icon className="size-6 text-primary" />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary/80 text-primary border border-primary/15">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-primary/90 mt-0.5">
                    {item.subtitle}
                  </p>

                  {/* Detailed Description */}
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                {/* Bottom Highlight */}
                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-[11px] font-bold text-foreground">
                  <span className="flex items-center gap-1 text-primary">
                    <ShieldCheck className="size-3.5" /> Verified Promise
                  </span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* WhatsApp Quick Order Callout Banner */}
        <div className="mt-10 rounded-3xl border border-primary/20 bg-gradient-to-r from-secondary via-background to-secondary p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shrink-0 shadow-md">
              <MessageCircle className="size-7" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-foreground">
                Need Help Ordering or Quick Delivery Info?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Reach out to Frances directly on WhatsApp at <strong className="text-primary font-bold">09114336301</strong> for fast assistance across Nigeria.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/2349114336301?text=Hello%20Frances!%20I%20am%20visiting%20the%20Francielle%20website%20and%20would%20like%20to%20inquire%20about%20delivery%20and%20products."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-lg shadow-primary/25 transition-all tap-feedback"
          >
            <MessageCircle className="size-4" />
            <span>Chat on WhatsApp</span>
            <ArrowRight className="size-4 ml-1" />
          </a>
        </div>

      </div>
    </section>
  );
}

