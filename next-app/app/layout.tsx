import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthContext } from '@/context/AutxContext';

import './globals.css';
import { CONFIG } from './config';
import { ThemeProvider } from '@/components/theme-provider';
import SocketProvider from '@/context/SocketContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: CONFIG.appTitle,
  description: CONFIG.appDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SocketProvider>
            <AuthContext>{children}</AuthContext>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
