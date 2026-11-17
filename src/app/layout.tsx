import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ShopProvider } from '../context/ShopContext';
import CartDrawer from '../components/CartDrawer';
import WishlistDrawer from '../components/WishlistDrawer';
import QuickViewModal from '../components/QuickViewModal';
import CheckoutModal from '../components/CheckoutModal';
import ToastContainer from '../components/ToastContainer';
import MobileBottomNav from '../components/MobileBottomNav';
import AdminModal from '../components/AdminModal';
import CategoryDrawer from '../components/CategoryDrawer';
import FloatingCategoryButton from '../components/FloatingCategoryButton';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

export const metadata: Metadata = {
  metadataBase: new URL('https://frances-comerce.vercel.app'),
  title: {
    default: 'Francielle By Frances — A Little World of Lovely Things',
    template: '%s | Francielle By Frances',
  },
  description:
    'Francielle By Frances is a little world of lovely things designed to make every girl look and feel classy. We curate dreamy protective phone cases, radiant beauty products, luxury key holders, and timeless accessories that effortlessly elevate your daily aesthetic.',
  applicationName: 'Francielle By Frances',
  keywords: [
    'Francielle',
    'Francielle By Frances',
    'Phone Cases Nigeria',
    'Cute Phone Cases Kaduna',
    'Pearl Bracelet Wave Phone Case',
    'Ribbon Bow Phone Suction Mount',
    'Viral Bow Phone Grip',
    'Lip Gloss Nigeria',
    'Coquette Accessories Nigeria',
    'Girly Aesthetic Nigeria',
    'A Little World of Lovely Things',
    'Online Shopping Kaduna',
    'Fast Nationwide Delivery Nigeria',
  ],
  authors: [{ name: 'Francielle By Frances' }],
  creator: 'Francielle By Frances',
  publisher: 'Francielle By Frances',
  openGraph: {
    title: 'Francielle By Frances — A Little World of Lovely Things',
    description:
      'Francielle By Frances is a little world of lovely things designed to make every girl look and feel classy. We curate dreamy protective phone cases, radiant beauty products, luxury key holders, and timeless accessories that effortlessly elevate your daily aesthetic.',
    url: 'https://frances-comerce.vercel.app',
    siteName: 'Francielle By Frances',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: '/assets/images/logo.jpeg',
        width: 800,
        height: 800,
        alt: 'Francielle By Frances - A Little World of Lovely Things',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Francielle By Frances — A Little World of Lovely Things',
    description:
      'Francielle By Frances is a little world of lovely things designed to make every girl look and feel classy. We curate dreamy protective phone cases, radiant beauty products, luxury key holders, and timeless accessories that effortlessly elevate your daily aesthetic.',
    images: ['/assets/images/logo.jpeg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Francielle',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#f0008e',
};

const storeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'Francielle By Frances',
  alternateName: 'Francielle',
  description:
    'Francielle By Frances is a little world of lovely things designed to make every girl look and feel classy. We curate dreamy protective phone cases, radiant beauty products, luxury key holders, and timeless accessories that effortlessly elevate your daily aesthetic.',
  url: 'https://frances-comerce.vercel.app',
  logo: 'https://frances-comerce.vercel.app/assets/images/logo.jpeg',
  image: 'https://frances-comerce.vercel.app/assets/images/logo.jpeg',
  telephone: '+2349114336301',
  priceRange: '₦₦',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kaduna',
    addressRegion: 'Kaduna State',
    addressCountry: 'NG',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Nigeria',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-foreground pb-20 md:pb-0 overflow-x-hidden w-full max-w-full">
        <ShopProvider>
          {children}
          {/* Global Drawers & Modals */}
          <CartDrawer />
          <WishlistDrawer />
          <QuickViewModal />
          <CheckoutModal />
          <CategoryDrawer />
          <AdminModal />
          <ToastContainer />
          {/* Floating Category Filter FAB */}
          <FloatingCategoryButton />
          {/* Mobile Bottom App Navigation */}
          <MobileBottomNav />
          {/* Progressive Web App (PWA) Install Recommendation */}
          <PWAInstallPrompt />
        </ShopProvider>
      </body>
    </html>
  );
}
