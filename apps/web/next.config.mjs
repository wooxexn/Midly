const apiOrigin = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api'
).replace(/\/api\/?$/, '');

// Kakao 지도/공유 SDK, 폰트 CDN, API 오리진을 허용하는 CSP
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com https://t1.kakaocdn.net https://*.daumcdn.net https://*.kakao.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${apiOrigin} https://dapi.kakao.com https://*.daumcdn.net https://*.kakao.com`,
  "frame-src https://*.kakao.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(), camera=(), microphone=()',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@midly/shared'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
