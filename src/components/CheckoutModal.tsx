'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useShop } from '../context/ShopContext';
import { CustomerDetails } from '../types';
import {
  X,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  Copy,
  Check,
  ShieldCheck,
  Building,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const NIGERIAN_STATES = [
  'Kaduna State',
  'Abuja (FCT)',
  'Lagos State',
  'Kano State',
  'Plateau State (Jos)',
  'Rivers State (Port Harcourt)',
  'Oyo State (Ibadan)',
  'Ogun State',
  'Delta State',
  'Edo State (Benin City)',
  'Enugu State',
  'Anambra State (Awka/Onitsha)',
  'Kwara State (Ilorin)',
  'Imo State (Owerri)',
  'Akwa Ibom State (Uyo)',
  'Ondo State',
  'Abia State',
  'Cross River State (Calabar)',
  'Other Nigerian State',
];

export default function CheckoutModal() {
  const router = useRouter();
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    settings,
    clearCart,
    createOrder,
    showToast,
  } = useShop();

  // Steps: 'details' -> 'payment'
  const [step, setStep] = useState<'details' | 'payment'>('details');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneAlt, setPhoneAlt] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('Kaduna State');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState(''); // Popular bus stop / closest landmark
  const [notes, setNotes] = useState('');

  // UI States
  const [showItemsList, setShowItemsList] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const isKaduna = state.toLowerCase().includes('kaduna');
  const isLagos = state.toLowerCase().includes('lagos');
  const finalTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Step 1 -> Step 2: Validate delivery fields and proceed to payment
  const handleProceedToPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim() || !landmark.trim()) {
      showToast('Please fill all required delivery details to proceed to payment!', 'warning');
      return;
    }

    setStep('payment');
  };

  // Step 2: User clicks "I Have Made Transfer"
  const handleConfirmTransfer = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const customer: CustomerDetails = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        phoneAlt: phoneAlt.trim() || undefined,
        email: email.trim(),
        state,
        city: city.trim() || (isKaduna ? 'Kaduna' : isLagos ? 'Lagos' : state),
        address: address.trim(),
        landmark: landmark.trim(),
        notes: notes.trim() || undefined,
      };

      // Creates and stores the order in Supabase & localStorage, then redirects to order receipt page
      const orderId = await createOrder(customer);
      if (orderId) {
        showToast('Transfer recorded! Loading your official receipt... 🌸', 'sparkle');
        setIsCheckoutOpen(false);
        setStep('details');
        router.push(`/order?id=${orderId}`);
      }
    } catch (err) {
      console.error('Error during checkout transfer:', err);
      showToast('Could not complete order. Please try again.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('9114336301');
    setCopiedAccount(true);
    showToast('OPAY Account number (9114336301) copied! 📋', 'sparkle');
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(finalTotal.toString());
    setCopiedAmount(true);
    showToast(`Amount (₦${finalTotal.toLocaleString()}) copied! 📋`, 'sparkle');
    setTimeout(() => setCopiedAmount(false), 3000);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep('details');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-5 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative bg-card rounded-3xl border border-primary/20 max-w-xl w-full p-4 sm:p-7 shadow-2xl z-10 my-4 sm:my-8 max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors z-20"
          aria-label="Close Checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'details' ? (
          /* ==================================================== */
          /* STEP 1: DELIVERY & CUSTOMER DETAILS                  */
          /* ==================================================== */
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            
            {/* Header */}
            <div className="pb-3 border-b border-border">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground">
                    Delivery Details · Nigeria
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  Step 1 of 2
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Please provide your contact &amp; address details with your <strong>closest popular bus stop</strong> for prompt dispatch.
              </p>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              
              {/* SECTION 1: Customer Contact */}
              <div className="p-3.5 rounded-2xl bg-secondary/25 border border-primary/10 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Contact Information</span>
                </p>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Receiver's Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chioma Adebayo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-card border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-foreground shadow-2xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-primary" />
                      <span>Phone (WhatsApp) <span className="text-primary">*</span></span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-card border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-foreground shadow-2xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span>Alternative Phone <span className="text-muted-foreground text-[10px] font-normal">(optional)</span></span>
                    </label>
                    <input
                      type="tel"
                      placeholder="08198765432"
                      value={phoneAlt}
                      onChange={(e) => setPhoneAlt(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-card border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-foreground shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <span>Email Address <span className="text-primary">*</span></span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="chioma@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-card border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-foreground shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* SECTION 2: Delivery Address & Landmark */}
              <div className="p-3.5 rounded-2xl bg-secondary/25 border border-primary/10 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>2. Delivery Destination (Nigeria)</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Delivery State <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full text-xs sm:text-sm bg-card border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-foreground shadow-2xs font-medium appearance-none cursor-pointer pr-8"
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      City / Area / Town <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isKaduna ? 'e.g. Barnawa / Kaduna South' : 'e.g. Area, Town or LGA'}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-card border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-foreground shadow-2xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Detailed Delivery Address <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. No. 12, Sultan Road / Crescent, Barnawa / Area"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-card border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-foreground shadow-2xs font-medium"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Include house number, street name, and estate name (if applicable).
                  </p>
                </div>

                {/* CRITICAL: CLOSEST LANDMARK & POPULAR BUS STOP */}
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 space-y-1">
                  <label className="block text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-primary" />
                    <span>Closest Landmark / Popular Bus Stop <span className="text-primary">*</span></span>
                  </label>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Enter the most popular <strong>bus stop, junction, or filling station</strong> near you. Delivery dispatch riders in Nigeria use this to find your location immediately.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Total Filling Station Junction / Post Office Bus Stop"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-card border border-primary/40 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-foreground shadow-xs font-bold placeholder:font-normal placeholder:text-muted-foreground/70"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Special Delivery Instructions <span className="text-muted-foreground text-[10px] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call before arrival, leave at security gate"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-card border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-foreground shadow-2xs"
                  />
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                    <span>Order Items ({cart.reduce((s, i) => s + i.qty, 0)} pcs)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowItemsList(!showItemsList)}
                    className="text-[11px] text-primary font-bold hover:underline"
                  >
                    {showItemsList ? 'Hide items' : 'View items'}
                  </button>
                </div>

                {showItemsList && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 border-t border-border/60 pt-2">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2 truncate pr-2">
                          {item.image && (
                            <div className="relative w-7 h-7 rounded-md overflow-hidden border border-border flex-shrink-0">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                          )}
                          <div className="truncate">
                            <p className="font-semibold text-foreground truncate">{item.name}</p>
                            {item.variant && (
                              <p className="text-[10px] text-primary font-medium">{item.variant}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right whitespace-nowrap font-mono text-[11px]">
                          <span>{item.qty} × ₦{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Calculations */}
                <div className="space-y-1 pt-2 border-t border-border/60 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-foreground">₦{cartSubtotal.toLocaleString()}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-primary font-bold">
                      <span>Discount ({appliedCoupon}):</span>
                      <span>-₦{cartDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Delivery:</span>
                    <span className="font-semibold text-primary text-[11px]">
                      Distance-Based (Billed by Dispatcher)
                    </span>
                  </div>

                  {/* Dispatcher Notice */}
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-foreground leading-snug space-y-0.5">
                    <p className="font-bold flex items-center gap-1 text-primary">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Delivery Fee Notice:</span>
                    </p>
                    <p className="text-muted-foreground">
                      Delivery fee depends on distance and the fee raised by the dispatcher upon dispatch (24–48 hours within Kaduna; 3–4 days outside Kaduna).
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-sm sm:text-base font-bold text-foreground border-t border-border pt-1.5">
                    <span>Items Total Payable:</span>
                    <span className="text-primary font-black text-lg sm:text-xl">
                      ₦{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Step Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs sm:text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 tap-feedback"
                >
                  <span>Proceed to Payment (₦{finalTotal.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secure bank transfer to official OPAY store account</span>
                </div>
              </div>

            </form>
          </div>
        ) : (
          /* ==================================================== */
          /* STEP 2: PAYMENT PAGE (ACCOUNT INFORMATION)           */
          /* ==================================================== */
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 animate-fade-in">
            
            {/* Step Navigation Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Details</span>
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                Step 2 of 2: Payment
              </span>
            </div>

            {/* Title & Amount Announcement */}
            <div className="text-center space-y-1 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 border border-primary/20 shadow-xs">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-foreground">
                Make Bank Transfer Payment
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Please transfer exactly <strong className="text-primary font-bold text-sm">₦{finalTotal.toLocaleString()}</strong> to the official Francielle account below:
              </p>
            </div>

            {/* Bank Account Details Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-secondary/40 border-2 border-primary/30 space-y-3.5 shadow-xs">
              
              {/* Bank Name */}
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bank Name</p>
                  <p className="text-base sm:text-lg font-black text-foreground flex items-center gap-2 mt-0.5">
                    <span>OPAY</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                      OPAY DIGITAL SERVICES
                    </span>
                  </p>
                </div>
              </div>

              {/* Account Number with One-Click Copy */}
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Number</p>
                  <p className="text-xl sm:text-2xl font-mono font-black text-primary tracking-wider mt-0.5">
                    911 433 6301
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 text-xs font-bold transition-all tap-feedback"
                  title="Copy OPAY account number"
                >
                  {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAccount ? 'Copied!' : 'Copy Number'}</span>
                </button>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Name</p>
                  <p className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wide flex items-center gap-1 mt-0.5">
                    <span>FRANCES EJIRO ITHENUMAH</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 inline-block flex-shrink-0" />
                  </p>
                </div>
              </div>

              {/* Amount to Transfer */}
              <div className="flex items-center justify-between pt-0.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount to Transfer</p>
                  <p className="text-xl sm:text-2xl font-black text-primary mt-0.5">
                    ₦{finalTotal.toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold transition-all"
                  title="Copy total amount"
                >
                  {copiedAmount ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span>{copiedAmount ? 'Copied' : 'Copy ₦'}</span>
                </button>
              </div>
            </div>

            {/* Quick Step Guide */}
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-primary text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Payment Instructions:</span>
              </p>
              <ol className="list-decimal list-inside text-muted-foreground text-[11px] space-y-1 leading-relaxed">
                <li>Open your banking app or dial your bank USSD code.</li>
                <li>Transfer exactly <strong>₦{finalTotal.toLocaleString()}</strong> to <strong>9114336301 (OPAY)</strong>.</li>
                <li>Verify recipient name displays <strong>FRANCES EJIRO ITHENUMAH</strong>.</li>
                <li>Once sent, click <strong>"I Have Made Transfer"</strong> below to view your official receipt!</li>
              </ol>
            </div>

            {/* Delivery reminder */}
            <p className="text-[10px] text-muted-foreground text-center italic">
              Note: Delivery fee is distance-based and billed upon rider dispatch (24–48h within Kaduna; 3–4 days outside Kaduna).
            </p>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmTransfer}
                className="w-full py-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs sm:text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 tap-feedback disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Made Transfer ✓</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-full py-2.5 rounded-full border border-border hover:bg-secondary text-muted-foreground text-xs font-bold transition-all"
              >
                <span>← Edit Delivery Address &amp; Info</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
