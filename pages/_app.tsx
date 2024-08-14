import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css';
import PlausibleProvider from 'next-plausible';

import dotenv from 'dotenv';
dotenv.config();

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <PlausibleProvider domain="tryaudiochat.com">
        <Component {...pageProps} />
      </PlausibleProvider>
      <Analytics />
    </SessionProvider>
  );
}

export default MyApp;
