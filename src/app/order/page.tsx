'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SafeImage from '../../components/SafeImage';
import { useSearchParams, useRouter } from 'next/navigation';
import { useShop, buildOrderWhatsAppUrl } from '../../context/ShopContext';
import { Order } from '../../types';
import { fetchOrderByIdFromSupabase } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Printer,
  MessageCircle,
  ArrowLeft,
  ShoppingBag,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  Heart,
  Share2,
  ImageIcon,
  Download,
  Loader2,
} from 'lucide-react';

function OrderReceiptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { orders, settings, showToast } = useShop();

  const [order, setOrder] = useState<Order | null>(null);
  const [targetOrderRef, setTargetOrderRef] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  useEffect(() => {
    // Determine Order ID from search params, hash, or fallback to latest order
    let targetId = searchParams.get('id') || '';

    if (!targetId && typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        targetId = hash;
      } else {
        const latestSaved = localStorage.getItem('fancielle_latest_order_id');
        if (latestSaved) targetId = latestSaved;
      }
    }

    const cleanId = targetId.replace(/^#/, '').trim();
    setTargetOrderRef(cleanId);

    if (!cleanId) {
      if (orders.length > 0) {
        setOrder(orders[0]);
        triggerConfetti();
      }
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadOrder = async () => {
      // 1. Look in Context
      const fromContext = orders.find(
        o => o.id === cleanId || o.id === `#${cleanId}` || o.id.replace(/^#/, '') === cleanId
      );
      if (fromContext) {
        if (!isCancelled) {
          setOrder(fromContext);
          setIsLoading(false);
          triggerConfetti();
        }
        return;
      }

      // 2. Look in localStorage
      try {
        const saved = localStorage.getItem('fancielle_orders');
        if (saved) {
          const parsed: Order[] = JSON.parse(saved);
          const match = parsed.find(
            o => o.id === cleanId || o.id === `#${cleanId}` || o.id.replace(/^#/, '') === cleanId
          );
          if (match) {
            if (!isCancelled) {
              setOrder(match);
              setIsLoading(false);
              triggerConfetti();
            }
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading orders from localStorage', e);
      }

      // 3. Fallback: Query Supabase cloud
      try {
        const remoteOrder = await fetchOrderByIdFromSupabase(cleanId);
        if (isCancelled) return;
        if (remoteOrder) {
          setOrder(remoteOrder);
          // Cache in local storage for instant offline / reload access
          try {
            const saved = localStorage.getItem('fancielle_orders');
            const existing: Order[] = saved ? JSON.parse(saved) : [];
            if (!existing.some(o => o.id === remoteOrder.id || o.id.replace(/^#/, '') === cleanId)) {
              localStorage.setItem('fancielle_orders', JSON.stringify([remoteOrder, ...existing]));
            }
          } catch (err) {}
          triggerConfetti();
        }
      } catch (err) {
        console.warn('Supabase fetchOrderById error:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      isCancelled = true;
    };
  }, [searchParams, orders, retryCount]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F0008E', '#FFB5DB', '#FFE2EF', '#FFD700', '#5A1136', '#FFFFFF'],
      });
    } catch (e) {
      // Ignore if canvas-confetti has environment issue
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!order) return;
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    try {
      setIsDownloadingImage(true);
      showToast('Generating receipt image... 🌸', 'sparkle');

      // Dynamically import html2canvas for instant client-side rendering
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Francielle-Receipt-${order.id}.png`;
      link.href = imageUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Receipt image downloaded to device! 💖', 'bag');
    } catch (err) {
      console.error('Image download error:', err);
      showToast('Could not save image. You can use "Print / Save PDF".', 'warning');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const handleCopyReceipt = () => {
    if (!order) return;
    const text = `💗 FRANCIELLE BY FRANCES - ORDER RECEIPT 💗
Order Reference: #${order.id}
Customer: ${order.customer.fullName}
Phone: ${order.customer.phone}
Delivery Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.state}
Closest Bus Stop / Landmark: ${order.customer.landmark}
Items Total: ₦${order.total.toLocaleString()}
Delivery Fee: Distance-based (billed by dispatcher upon dispatch)
Date: ${new Date(order.createdAt).toLocaleDateString()}`;

    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    showToast('Order receipt copied to clipboard! 📋', 'sparkle');
    setTimeout(() => setCopiedReceipt(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full bg-secondary text-primary flex items-center justify-center animate-pulse mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground">Loading your order receipt...</p>
        <p className="text-xs text-muted-foreground mt-1">Francielle By Frances · A Little World of Lovely Things</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Order Not Found</h2>
        {targetOrderRef && (
          <p className="inline-block px-3 py-1 bg-secondary rounded-full text-xs font-mono font-bold text-primary my-2">
            #{targetOrderRef}
          </p>
        )}
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">
          We couldn't locate this order in cloud sync. If the order was placed just moments ago, tap "Check Again" to re-check.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setRetryCount(prev => prev + 1);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all tap-feedback"
          >
            <Sparkles className="w-4 h-4" />
            <span>Check Again / Refresh</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 transition-all border border-border"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  const whatsappUrl = buildOrderWhatsAppUrl(order, settings.phoneWhatsapp);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* 1. TOP HEADER (Hidden on print) */}
      <header className="no-print sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReceipt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-secondary text-xs font-medium transition-all"
              title="Copy receipt details"
            >
              {copiedReceipt ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              <span className="hidden sm:inline">{copiedReceipt ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isDownloadingImage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card hover:bg-secondary border border-primary/30 text-primary text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
              title="Download order receipt as image"
            >
              {isDownloadingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Save Image</span>
              <span className="sm:hidden">Image</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card hover:bg-secondary border border-primary/30 text-primary text-xs font-bold shadow-2xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Connect with Vendor</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. CELEBRATORY HERO BANNER (Hidden on print) */}
      <div className="no-print max-w-3xl mx-auto px-4 pt-6 pb-2 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 text-primary mb-3 shadow-inner">
          <CheckCircle2 className="w-8 h-8 text-primary animate-bounce" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Thank You! Your Order is Placed 🌸
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1">
          Order reference <span className="font-bold text-primary">#{order.id}</span> has been confirmed. You can save or print your official receipt below.
        </p>

        {/* CONNECT WITH VENDOR CALLOUT BANNER */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-secondary to-primary/10 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-black text-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>Notify Frances About Your Order &amp; Transfer</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Send your order receipt link to Frances on WhatsApp to confirm payment &amp; dispatch.
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md shadow-primary/25 transition-all tap-feedback shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Connect with Vendor</span>
          </a>
        </div>
      </div>

      {/* 3. PRINTABLE OFFICIAL INVOICE CARD */}
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <div
          id="printable-invoice"
          className="bg-card rounded-3xl border border-primary/25 p-5 sm:p-8 shadow-sm space-y-6"
        >
          {/* Header of Receipt */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-xs flex-shrink-0 bg-white">
                <Image
                  src={settings.logoUrl || '/assets/images/logo.jpeg'}
                  alt="Francielle By Frances Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
                  {settings.storeName || 'Francielle By Frances'}
                </h2>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {settings.tagline || 'A Little World of Lovely Things 🌸'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  WhatsApp: +234 911 433 6301 · Kaduna, Nigeria
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-primary font-mono font-bold text-xs">
                <span>ORDER #{order.id}</span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center sm:justify-end gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span>{formattedDate}</span>
              </p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                Status: {order.status.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Landmark Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-secondary/40 border border-primary/10">
            {/* Customer Details */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>Customer Details</span>
              </p>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-foreground">{order.customer.fullName}</p>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3 text-primary" />
                  <span>{order.customer.phone}</span>
                  {order.customer.phoneAlt && (
                    <span className="text-[10px]">({order.customer.phoneAlt})</span>
                  )}
                </p>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <span>{order.customer.email}</span>
                </p>
              </div>
            </div>

            {/* Delivery Destination & Bus Stop */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Delivery Address</span>
              </p>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-foreground">
                  {order.customer.address}
                </p>
                <p className="text-muted-foreground">
                  {order.customer.city}, {order.customer.state} State, Nigeria
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-primary/20 text-foreground font-medium text-[11px]">
                  <Truck className="w-3 h-3 text-primary flex-shrink-0" />
                  <span>
                    <strong>Closest Bus Stop:</strong> {order.customer.landmark || 'Not provided'}
                  </span>
                </div>
                {order.customer.notes && (
                  <p className="text-[10px] text-muted-foreground italic pt-1">
                    Special notes: {order.customer.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Order Items ({order.items.reduce((s, i) => s + i.qty, 0)} pcs)
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-xs text-left">
                <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase text-[10px] border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">Item Details</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-secondary/20">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {item.image && (
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-border flex-shrink-0">
                              <SafeImage
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">{item.name}</p>
                            {item.variant && (
                              <p className="text-[11px] text-primary font-medium">
                                Option: {item.variant}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-foreground">
                        {item.qty}
                      </td>
                      <td className="py-3 px-3 text-right text-muted-foreground font-mono">
                        ₦{item.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-foreground font-mono">
                        ₦{(item.qty * item.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="pt-2 space-y-1.5 text-xs text-right border-t border-border">
            <div className="flex justify-between py-1 text-muted-foreground">
              <span>Items Subtotal:</span>
              <span className="font-mono text-foreground font-bold">
                ₦{order.subtotal.toLocaleString()}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between py-1 text-primary">
                <span>Discount Applied:</span>
                <span className="font-mono font-bold">-₦{order.discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between py-1 text-muted-foreground">
              <span>Delivery Fee:</span>
              <span className="font-medium text-foreground text-[11px]">
                Determined by Dispatcher (Distance-Based)
              </span>
            </div>

            <div className="flex justify-between py-2 text-sm sm:text-base font-black text-foreground border-t border-primary/20">
              <span>Items Total Amount:</span>
              <span className="text-primary text-xl sm:text-2xl font-black">
                ₦{order.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Delivery Policy Note Box */}
          <div className="p-3.5 rounded-2xl bg-secondary/30 border border-primary/20 text-xs text-foreground space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-primary text-[11px] uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery Information &amp; Dispatch Policy:</span>
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              • <strong>Delivery Fee</strong>: Delivery price is not fixed — it depends on the distance from our dispatch hub to your address ({order.customer.city}, {order.customer.state}) and the fee charged by the dispatch rider upon dispatch.
              <br />
              • <strong>Dispatch Schedule</strong>: 24–48 hours within Kaduna; 3–4 days outside Kaduna (nationwide across Nigeria).
              <br />
              • <strong>Tracking &amp; Inquiries</strong>: Frances will contact you directly on WhatsApp (<strong>{order.customer.phone}</strong>) before rider dispatch.
            </p>
          </div>

          {/* Invoice Footer Sign-off */}
          <div className="pt-4 border-t border-border text-center space-y-1">
            <p className="text-xs font-bold text-foreground">
              Thank you for choosing Francielle By Frances! 🌸
            </p>
            <p className="text-[10px] text-muted-foreground">
              A Little World of Lovely Things · Direct Contact: +234 911 433 6301
            </p>
          </div>
        </div>

        {/* 4. BOTTOM ACTION TOOLBAR (Hidden on print) */}
        <div className="no-print pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border hover:bg-secondary text-foreground text-xs font-bold transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>Continue Shopping</span>
          </Link>

          <div className="flex flex-wrap w-full sm:w-auto gap-2">
            <button
              onClick={handleDownloadImage}
              disabled={isDownloadingImage}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-card hover:bg-secondary border border-primary/30 text-primary text-xs font-bold shadow-xs transition-all tap-feedback disabled:opacity-50"
            >
              {isDownloadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              <span>Download Image</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-card hover:bg-secondary border border-primary/30 text-primary text-xs font-bold shadow-xs transition-all tap-feedback"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md shadow-primary/25 transition-all tap-feedback"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect with Vendor</span>
            </a>
          </div>
        </div>
      </main>

      {/* 5. PRINT SPECIFIC STYLES */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          header, footer, nav {
            display: none !important;
          }
          #printable-invoice {
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
            padding: 20px !important;
            border-radius: 12px !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-full bg-secondary text-primary flex items-center justify-center animate-pulse mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">Loading your order...</p>
        </div>
      }
    >
      <OrderReceiptContent />
    </Suspense>
  );
}
