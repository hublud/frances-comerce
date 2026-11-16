'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

const PILLARS = [
  '💗 A Little World of Lovely Things',
  '📱 Girly Phone Cases',
  '💄 Beauty & Glow Essentials',
  '🎀 Girly Accessories',
  '🚚 Fast Delivery Across Nigeria',
  '🛍️ Seamless WhatsApp Checkout',
];

export default function BrandStory() {
  return (
    <section className="py-12 md:py-20 bg-background border-t border-border w-full max-w-full overflow-hidden" id="story">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Images Grid */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden border border-border bg-secondary shadow-md">
            <Image
              src="/assets/images/fancielle-lip-gloss.jpg"
              alt="Francielle Moisturising Keychain Lip Gloss"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden border border-border bg-secondary shadow-md mt-6">
            <Image
              src="/assets/images/fancielle-phone-suction.jpg"
              alt="Francielle Ribbon Bow Phone Suction Mount"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Story Text */}
        <div className="lg:col-span-6 flex flex-col gap-4 text-center lg:text-left items-center lg:items-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Brand</span>
          </div>

          <h2 className="text-2xl sm:text-4xl text-foreground font-black leading-tight tracking-tight">
            A Little World of <span className="text-primary">Lovely Things</span>
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Francielle By Frances is a little world of lovely things designed to make every girl look and feel classy. We curate dreamy protective phone cases, radiant beauty products, luxury key holders, and timeless accessories that effortlessly elevate your daily aesthetic.
          </p>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            With instant WhatsApp ordering and prompt dispatch within Kaduna (24–48 hours) and nationwide delivery (3–4 days across Abuja, Lagos, Port Harcourt, and all Nigerian states), shopping your favorite girly staples has never been more seamless.
          </p>

          {/* Pillars */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-2">
            {PILLARS.map((p, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-secondary text-foreground border border-border text-xs font-semibold"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
