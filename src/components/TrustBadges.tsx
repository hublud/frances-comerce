'use client';

import React from 'react';
import { Truck, BadgeCheck, RotateCcw, MessageCircle } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    desc: 'Across Nigeria promptly',
  },
  {
    icon: BadgeCheck,
    title: 'Top Quality',
    desc: '100% Curated premium items',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: 'Hassle-free guarantee',
  },
  {
    icon: MessageCircle,
    title: 'Instant Support',
    desc: 'Direct WhatsApp assistance',
  },
];

export default function TrustBadges() {
  return (
    <section className="bg-card border-y border-border py-4 sm:py-6 overflow-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {TRUST_POINTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs md:text-sm font-bold text-foreground leading-snug truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-tight truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
