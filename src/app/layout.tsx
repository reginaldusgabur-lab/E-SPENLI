import type { Metadata, Viewport } from 'next';

export const dynamic = 'force-dynamic';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import PwaInstaller from '@/components/pwa-installer';

export const metadata: Metadata = {
  title: 'E-SPENLI',
  description: 'Sistem Presensi Online SMPN 5 Langke Rembong',
  applicationName: 'E-SPENLI',
  appleWebApp: {
    capable: true,
    title: 'E-SPENLI',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#3F51B5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <PwaInstaller />
        <Toaster />
      </body>
    </html>
  );
}
