'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Share, Plus, X, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Francielle PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.error('Francielle Service Worker registration failed:', err);
          });
      });
    }

    // 2. Check if already running as installed standalone app
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // 3. Check if recently dismissed
    const dismissedAt = localStorage.getItem('fancielle_pwa_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) {
        return; // Don't show if dismissed within 3 days
      }
    }

    // 4. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      userAgent.includes('safari') &&
      !userAgent.includes('crios') &&
      !userAgent.includes('fxios') &&
      !userAgent.includes('chrome');

    setIsIOS(isIOSDevice);

    if (isIOSDevice && isSafari && !isStandaloneMode) {
      // Show iOS install recommendation after 3 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // 5. Capture standard beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 2.5 seconds so it feels natural
      setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem('fancielle_pwa_dismissed', Date.now().toString());
  };

  // If already installed or shouldn't show, render nothing
  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Floating Bottom Install Recommendation Banner */}
      <div className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-card/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border-2 border-primary/30 p-3.5 sm:p-4 shadow-xl shadow-primary/10 relative">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-secondary transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            {/* App Icon */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-primary/20 shrink-0 shadow-xs bg-white">
              <Image
                src="/icon-192.png"
                alt="Francielle App"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-foreground">
                  Install Francielle App
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Fast &amp; Offline
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                Add to your home screen for instant shopping and live delivery updates.
              </p>
            </div>
          </div>

          {/* Action Row */}
          {!showIOSGuide && (
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border/70">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2 px-3 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-bold transition-all text-center"
              >
                Not Now
              </button>

              {isIOS ? (
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/20 tap-feedback"
                >
                  <Share className="w-3.5 h-3.5" />
                  <span>How to Add 📲</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/20 tap-feedback"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App 📲</span>
                </button>
              )}
            </div>
          )}

          {/* iOS Safari Step-by-Step Instructions */}
          {showIOSGuide && (
            <div className="mt-3 pt-3 border-t border-border/80 space-y-2 animate-in fade-in">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>To add to your iPhone Home Screen:</span>
              </p>

              <ol className="text-[11px] text-foreground space-y-1.5 bg-secondary/30 p-2.5 rounded-xl border border-border">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-[10px] shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-primary" /> at the bottom of Safari.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-[10px] shrink-0">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> <Plus className="w-3.5 h-3.5 inline mx-0.5 text-primary" />.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-[10px] shrink-0">
                    3
                  </span>
                  <span>Tap <strong>Add</strong> in the top-right corner. Enjoy! 🌸</span>
                </li>
              </ol>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold text-center tap-feedback shadow-xs"
              >
                Got it, Thanks! 💖
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

