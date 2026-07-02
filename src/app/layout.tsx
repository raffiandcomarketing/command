import type { Metadata } from 'next';
import AuthSessionProvider from '@/components/providers/session-provider';
// Self-hosted Inter (deterministic builds - no Google Fonts fetch at build time)
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '../styles/globals.css';

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
      <body className="bg-white text-gray-900">
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
