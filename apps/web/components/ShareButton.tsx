'use client';

import { useState } from 'react';
import { shareToKakao } from '@/lib/kakao-share';

export function ShareButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/room/${code}`
        : '';

    // 1순위: 카카오톡 공유
    const shared = await shareToKakao({
      url,
      title: 'Midly · 공평한 중간지점 찾기',
      description: '출발지만 넣으면 모두에게 공평한 만날 곳을 찾아드려요.',
    });
    if (shared) return;

    // 폴백: OS 공유 시트 → 클립보드 복사
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Midly 모임', url });
        return;
      }
    } catch {
      /* 사용자가 공유 취소 — 무시 */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* 클립보드 실패 — 무시 */
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-soft px-3
                 text-sm font-semibold text-brand transition hover:bg-brand-soft/70
                 active:scale-95"
    >
      {copied ? '링크 복사됨' : '공유하기'}
    </button>
  );
}
