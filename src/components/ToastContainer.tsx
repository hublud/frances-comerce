'use client';

import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Heart, Sparkles, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toast } = useShop();

  if (!toast.show) return null;

  const icons = {
    bag: <ShoppingBag className="w-4 h-4 text-primary" />,
    heart: <Heart className="w-4 h-4 text-primary fill-primary" />,
    sparkle: <Sparkles className="w-4 h-4 text-primary" />,
    warning: <AlertCircle className="w-4 h-4 text-destructive" />,
    info: <Info className="w-4 h-4 text-primary" />,
  };

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:max-w-sm z-50 animate-fade-in pointer-events-none">
      <div className="bg-card/95 backdrop-blur-md border border-border text-foreground px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
        <div className="p-2 rounded-full bg-secondary shrink-0">
          {icons[toast.type] || icons.info}
        </div>
        <p className="text-xs sm:text-sm font-semibold flex-1 leading-snug">
          {toast.message}
        </p>
      </div>
    </div>
  );
}
