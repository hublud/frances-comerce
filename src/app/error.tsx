'use client';

import React, { useEffect } from 'react';
import { RotateCw, Home, Sparkles } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Francielle global error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-primary animate-pulse" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-foreground">A Little Hiccup Happened</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We encountered a momentary glitch loading this item. Don&apos;t worry, your cart and settings are completely safe!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all tap-feedback shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all tap-feedback border border-border"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Refresh Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
