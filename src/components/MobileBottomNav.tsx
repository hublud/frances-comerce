'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useShop } from '../context/ShopContext';
import { Home, Heart, ShoppingBag, Grid, Search } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const {
    cartTotalCount,
    cartAnimationTrigger,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsMobileSearchOpen,
    setActiveCategory,
  } = useShop();

  const [isCartBouncing, setIsCartBouncing] = React.useState(false);

  React.useEffect(() => {
    if (cartAnimationTrigger > 0) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 900);
      return () => clearTimeout(timer);
    }
  }, [cartAnimationTrigger]);

  // Hide customer mobile nav on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleHomeClick = () => {
    setActiveCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const shop = document.getElementById('products');
    if (shop) {
      shop.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#products';
    }
  };

  const handleSearchClick = () => {
    setIsMobileSearchOpen((prev) => !prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-mobile-nav safe-area-pb">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        
        {/* 1. Home */}
        <button
          onClick={handleHomeClick}
          className="flex flex-col items-center justify-center gap-0.5 text-foreground hover:text-primary transition-colors py-1 tap-feedback"
          aria-label="Home"
        >
          <Home className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* 2. Shop (Anchor Link to Products Section) */}
        <a
          href="#products"
          onClick={handleShopClick}
          className="flex flex-col items-center justify-center gap-0.5 text-foreground hover:text-primary transition-colors py-1 tap-feedback"
          aria-label="Shop catalog"
        >
          <Grid className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-bold">Shop</span>
        </a>

        {/* 3. Bag (Center Prominent with Counter & Bounce) */}
        <button
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 -mt-4 tap-feedback group transition-transform duration-300 ${
            isCartBouncing ? 'scale-110' : ''
          }`}
          aria-label="Shopping Bag"
        >
          <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-all duration-300 ${
            isCartBouncing ? 'ring-4 ring-pink-400/50 shadow-primary/50 scale-105' : ''
          }`}>
            <ShoppingBag className={`w-5 h-5 transition-transform duration-300 ${
              isCartBouncing ? 'animate-bounce scale-110' : ''
            }`} />
            {cartTotalCount > 0 && (
              <span className={`absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-white text-primary text-[10px] font-black rounded-full flex items-center justify-center shadow-md ring-2 ring-primary transition-all duration-300 ${
                isCartBouncing ? 'scale-125 bg-pink-100 ring-pink-600 animate-pulse' : ''
              }`}>
                {cartTotalCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-extrabold text-primary transition-colors ${
            isCartBouncing ? 'text-pink-600 font-black' : ''
          }`}>
            Bag
          </span>
        </button>

        {/* 4. Wishlist */}
        <button
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center justify-center gap-0.5 text-foreground hover:text-primary transition-colors py-1 tap-feedback"
          aria-label="Saved Wishlist"
        >
          <Heart className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-bold">Wishlist</span>
          {wishlist.length > 0 && (
            <span className="absolute top-1 right-4 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
              {wishlist.length}
            </span>
          )}
        </button>

        {/* 5. Search */}
        <button
          onClick={handleSearchClick}
          className="relative flex flex-col items-center justify-center gap-0.5 text-foreground hover:text-primary transition-colors py-1 tap-feedback"
          aria-label="Search items"
        >
          <Search className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-bold">Search</span>
        </button>

      </div>
    </div>
  );
}
