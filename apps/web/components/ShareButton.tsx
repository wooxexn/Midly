'use client';

import { useState } from 'react';

export function ShareButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/room/${code}`
        : '';
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
      {copied ? '링크 복사됨' : '초대 링크'}
    </button>
  );
}
