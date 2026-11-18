'use client';

import React, { useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import { SlidersHorizontal } from 'lucide-react';

export default function ProductGrid() {
  const { products, isLoadingProducts, activeCategory, searchQuery, sortBy, setSortBy } = useShop();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  const categoryTitles: Record<string, string> = {
    all: 'A Little World of Lovely Things',
    cases: 'Phone Cases & Tech Glam',
    beauty: 'Beauty & Glam Essentials',
    accessories: 'Girly Accessories',
    lifestyle: 'Classy Lifestyle & Gifting',
  };

  return (
    <main id="products" className="mx-auto max-w-7xl px-3 sm:px-4 pt-6 sm:pt-8 pb-16 scroll-mt-32 w-full max-w-full overflow-hidden">
      {/* Grid Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {categoryTitles[activeCategory] || 'Curated Catalog'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Hand-curated girly essentials delivered right to your doorstep across Nigeria.
          </p>
        </div>

        {/* Sort Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold bg-secondary/50 border border-border text-foreground rounded-full px-3 py-1.5 outline-none focus:border-primary cursor-pointer"
          >
            <option value="featured">✨ Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton Grid (Only shown when initial live database fetch is in progress) */}
      {isLoadingProducts && products.length === 0 ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border/70 rounded-3xl p-3 sm:p-4 flex flex-col animate-pulse"
            >
              <div className="aspect-square w-full rounded-2xl bg-secondary/80 mb-3" />
              <div className="h-3.5 w-3/4 bg-secondary/90 rounded-full mb-2" />
              <div className="h-3 w-1/2 bg-secondary/60 rounded-full mb-4" />
              <div className="mt-auto flex justify-between items-center pt-2">
                <div className="h-4 w-1/3 bg-secondary/90 rounded-full" />
                <div className="size-8 rounded-full bg-secondary/80" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-3xl">
          <div className="text-4xl mb-2">🌸</div>
          <h3 className="text-base font-bold text-foreground">No lovely items in this category yet</h3>
          <p className="text-xs text-muted-foreground mt-1">Try another category filter or search keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
