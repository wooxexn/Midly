'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
let sdkPromise: Promise<void> | null = null;

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// 오버레이 content는 innerHTML로 삽입되므로 사용자 입력(닉네임 등)을 반드시 이스케이프한다.
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

function loadSdk(): Promise<void> {
  if (window.kakao?.maps) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false&libraries=services`;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => reject(new Error('Kakao SDK 로드 실패'));
    document.head.appendChild(script);
  });
  return sdkPromise;
}

function originHtml(label?: string, color = '#2B44FF'): string {
  const safe = label ? escapeHtml(label) : '';
  return `<div style="transform:translateY(50%);display:flex;align-items:center;gap:6px;">
    <span style="width:14px;height:14px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(20,26,46,.25);"></span>
    ${safe ? `<span style="font:600 12px Pretendard,sans-serif;color:#141A2E;background:#fff;padding:2px 8px;border-radius:9999px;box-shadow:0 2px 6px rgba(20,26,46,.15);white-space:nowrap;">${safe}</span>` : ''}
  </div>`;
}

function spotHtml(label?: string): string {
  const safe = label ? escapeHtml(label) : '';
  return `<div style="transform:translateY(-4px);display:flex;flex-direction:column;align-items:center;">
    ${safe ? `<span style="font:700 13px Pretendard,sans-serif;color:#fff;background:#FF5A47;padding:4px 10px;border-radius:9999px;box-shadow:0 6px 16px rgba(255,90,71,.5);white-space:nowrap;margin-bottom:4px;">${safe}</span>` : ''}
    <span style="width:24px;height:24px;border-radius:9999px 9999px 9999px 2px;background:#FF5A47;border:4px solid #fff;box-shadow:0 8px 20px rgba(255,90,71,.45);transform:rotate(45deg);"></span>
  </div>`;
}

export function KakaoMap({
  origins,
  spot,
  className,
}: {
  origins: MapPoint[];
  spot?: MapPoint | null;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);

  useEffect(() => {
    if (!KEY || !ref.current) return;
    let cancelled = false;

    loadSdk()
      .then(() => {
        if (cancelled || !ref.current) return;
        const kakao = window.kakao;
        if (!mapRef.current) {
          mapRef.current = new kakao.maps.Map(ref.current, {
            center: new kakao.maps.LatLng(37.5665, 126.978),
            level: 6,
          });
        }
        renderMarkers();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current) renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origins, spot]);

  function renderMarkers() {
    const kakao = window.kakao;
    const map = mapRef.current;
    if (!kakao || !map) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    const bounds = new kakao.maps.LatLngBounds();
    let count = 0;

    for (const o of origins) {
      const pos = new kakao.maps.LatLng(o.lat, o.lng);
      bounds.extend(pos);
      count++;
      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: originHtml(o.label, o.color),
        yAnchor: 1,
        zIndex: 1,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    }

    if (spot) {
      const pos = new kakao.maps.LatLng(spot.lat, spot.lng);
      bounds.extend(pos);
      count++;
      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: spotHtml(spot.label),
        yAnchor: 1,
        zIndex: 2,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    }

    if (count > 0) map.setBounds(bounds, 70, 70, 70, 70);
  }

  if (!KEY) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-soft to-surface ${className}`}
      >
        <p className="px-6 text-center text-sm text-muted">
          지도 키(NEXT_PUBLIC_KAKAO_MAP_KEY)를 설정하면
          <br />
          여기에 지도가 표시돼요.
        </p>
      </div>
    );
  }

  return <div ref={ref} className={className} />;
}
