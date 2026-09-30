import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://midly-mu.vercel.app',
  ),
  title: 'Midly — 공평한 중간지점 찾기',
  description:
    '흩어진 친구들·스터디원들이 대중교통 기준 가장 공평하게 모일 중간지점을 찾아줍니다.',
  openGraph: {
    title: 'Midly — 공평한 중간지점 찾기',
    description: '출발지만 넣으면 모두에게 공평한 만날 곳을 찾아드려요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Midly',
  },
};

export const viewport: Viewport = {
  themeColor: '#F4F6FA',
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
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
