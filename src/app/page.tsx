import React from 'react';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import HeroBanner from '../components/HeroBanner';
import TrustBadges from '../components/TrustBadges';
import ProductGrid from '../components/ProductGrid';
import FastDeliveryShowcase from '../components/FastDeliveryShowcase';
import MarqueeBanner from '../components/MarqueeBanner';
import BrandStory from '../components/BrandStory';
import CustomerReviews from '../components/CustomerReviews';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <Header />

      {/* Horizontal Category Nav */}
      <CategoryTabs />

      {/* Hero Showcase */}
      <HeroBanner />

      {/* Curated Product Catalog */}
      <ProductGrid />

      {/* Fast Delivery & Trust Showcase (Replacing AI Concierge) */}
      <FastDeliveryShowcase />

      {/* Infinite Marquee Ticker */}
      <MarqueeBanner />

      {/* Brand Story */}
      <BrandStory />

      {/* Customer Feedback & Reviews (Testimonials) */}
      <CustomerReviews />

      {/* Trust & Guarantee Highlights Ribbon (Under Testimonials) */}
      <TrustBadges />

      {/* Footer */}
      <Footer />
    </main>
  );
}
