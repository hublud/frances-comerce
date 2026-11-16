'use client';

import React from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';

export default function MarqueeBanner() {
  const items = [
    { text: 'FRANCIELLE BY FRANCES', icon: Star },
    { text: 'A LITTLE WORLD OF LOVELY THINGS', icon: Sparkles },
    { text: 'GIRLY PHONE CASES & TECH GLAM', icon: Heart },
    { text: 'BEAUTY PRODUCTS & GLOW ESSENTIALS', icon: Star },
    { text: 'GIRLY ACCESSORIES', icon: Sparkles },
    { text: 'WHATSAPP: 09114336301', icon: Heart },
    { text: 'NATIONWIDE DELIVERY ACROSS NIGERIA', icon: Star },
    { text: 'TO MAKE EVERY GIRL LOOK CLASSY', icon: Sparkles },
  ];

  return (
    <div className="bg-secondary text-foreground py-3 overflow-hidden border-y border-primary/20 select-none w-full max-w-full">
      <div className="flex w-max animate-marquee gap-8 items-center text-xs sm:text-sm font-black uppercase tracking-[0.2em]">
        {[...items, ...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <span>{item.text}</span>
              <Icon className="w-3.5 h-3.5 text-primary fill-primary shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
