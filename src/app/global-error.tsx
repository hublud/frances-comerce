'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Francielle global layout error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fff7fb] text-[#1c1917] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-[#ffb5db]/40 rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#f0008e]/10 text-[#f0008e] flex items-center justify-center text-2xl">
            🌸
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-[#1c1917]">Francielle By Frances</h2>
            <p className="text-xs text-[#78716c] leading-relaxed">
              We encountered a momentary glitch. Your cart and lovely selections are completely safe!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => reset()}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#f0008e] hover:bg-[#d6007e] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Try Again
            </button>

            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#fce7f3] hover:bg-[#fbcfe8] text-[#831843] text-xs font-bold transition-all border border-[#f472b6]/30 cursor-pointer"
            >
              Refresh Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
