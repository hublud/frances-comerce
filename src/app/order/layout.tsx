import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmation & Official Receipt 🌸 | Francielle By Frances',
  description:
    'Official Francielle By Frances order receipt. View your confirmed items, delivery address, dispatch status, and vendor transfer reference.',
  openGraph: {
    title: 'Order Confirmation & Official Receipt 🌸 | Francielle By Frances',
    description:
      'Official Francielle By Frances order receipt. View your confirmed items, delivery address, dispatch status, and vendor transfer reference.',
    url: 'https://frances-comerce.vercel.app/order',
    siteName: 'Francielle By Frances',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: 'https://frances-comerce.vercel.app/assets/images/logo.jpeg',
        width: 800,
        height: 800,
        alt: 'Francielle By Frances Order Confirmation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Order Confirmation & Official Receipt 🌸 | Francielle By Frances',
    description:
      'Official Francielle By Frances order receipt. View your confirmed items, delivery address, dispatch status, and vendor transfer reference.',
    images: ['https://frances-comerce.vercel.app/assets/images/logo.jpeg'],
  },
};

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
