import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-4">
        <span className="text-6xl sm:text-8xl font-black text-primary/40 select-none">404</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        The lovely page you are looking for does not exist or has been moved to our curated shop.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-md transition-all tap-feedback"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shop</span>
      </Link>
    </div>
  );
}

