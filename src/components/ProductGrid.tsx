'use client';

import React, { useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import { SlidersHorizontal } from 'lucide-react';

export default function ProductGrid() {
  const { products, activeCategory, searchQuery, sortBy, setSortBy } = useShop();

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
  }, [activeCategory, searchQuery, sortBy]);

  const categoryTitles: Record<string, string> = {
    all: 'A Little World of Lovely Things',
    cases: 'Phone Cases & Tech Glam',
    beauty: 'Beauty & Glam Essentials',
    accessories: 'Girly Accessories',
    lifestyle: 'Classy Lifestyle & Gifting',
    basics: 'Daily Basics',
    bed: 'Bed & Lounging',
    travel: 'Travel & Gifting',
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

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-3xl">
          <div className="text-4xl mb-2">🌸</div>
          <h3 className="text-base font-bold text-foreground">No lovely items match your search</h3>
          <p className="text-xs text-muted-foreground mt-1">Try another keyword or switch category filters.</p>
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
