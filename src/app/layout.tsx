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
  title: 'Francielle By Frances — Fast Delivery Across Nigeria',
  description: 'Shop daily basics, accessories, bed & lounging, and travel & gifting. Fast nationwide delivery across Nigeria in signature girly pink aesthetics.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
