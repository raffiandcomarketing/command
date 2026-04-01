import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Raffi Command Centre',
  description: 'Luxury retail business command centre dashboard',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
