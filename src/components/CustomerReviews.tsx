'use client';

import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Toluwanimi A.',
    city: 'Lekki, Lagos',
    product: 'Cloud Lounge Set',
    rating: 5,
    date: 'Yesterday',
    text: 'Literally the softest lounge set I have ever owned! The blush pink color is absolute perfection, and it arrived in Lekki within 24 hours. Ordering on WhatsApp was so fast!',
  },
  {
    name: 'Amina B.',
    city: 'Maitama, Abuja',
    product: 'Pearl Chain Mini Bag',
    rating: 5,
    date: '2 days ago',
    text: 'I wore this bag to a birthday dinner in Abuja and got compliments from everyone. The pearl detail is high quality and feels so luxury.',
  },
  {
    name: 'Somtochukwu E.',
    city: 'Port Harcourt',
    product: 'Mini Carry-On Suitcase',
    rating: 5,
    date: '3 days ago',
    text: 'The glossy pink finish is breathtaking! The wheels glide so quietly and effortlessly. Definitely the main character luggage for my trip!',
  },
];

export default function CustomerReviews() {
  return (
    <section className="py-12 md:py-18 bg-secondary/30 border-t border-border w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Customer Love
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1 tracking-tight">
            Loved by Girly Souls Across Nigeria
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Real reviews from our shoppers across Lagos, Abuja, Port Harcourt, and nationwide.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 text-primary mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-primary" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-4">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground flex items-center gap-1">
                    <span>{review.name}</span>
                    <CheckCircle className="size-3 text-primary" />
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {review.city} · {review.product}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
