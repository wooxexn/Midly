import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Midly — 공평한 중간지점 찾기',
  description:
    '흩어진 친구들·스터디원들이 대중교통 기준 가장 공평하게 모일 중간지점을 찾아줍니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
