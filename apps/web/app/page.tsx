'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConvergeRoutes } from '@/components/ConvergeRoutes';
import { Button } from '@/components/ui/Button';
import { useCreateRoom } from '@/lib/hooks';

const STEPS = [
  { n: '1', label: '모임 만들기', color: '#2B44FF' },
  { n: '2', label: '링크 공유', color: '#12B5A5' },
  { n: '3', label: '중간지점 확인', color: '#F6A609' },
];

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const createRoom = useCreateRoom();

  const onCreate = () => {
    createRoom.mutate(title.trim() || undefined, {
      onSuccess: ({ code }) => router.push(`/room/${code}`),
    });
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <span className="eyebrow">Midly</span>
        <span className="font-data text-xs text-muted">공평한 중간지점</span>
      </header>

      <div className="flex flex-1 flex-col justify-center">
        <div
          className="animate-fade-up"
          style={{ opacity: 0, animationDelay: '0.05s' }}
        >
          <ConvergeRoutes className="mx-auto w-full max-w-[340px]" />
        </div>

        <h1
          className="animate-fade-up mt-6 text-balance text-[2rem] font-extrabold leading-[1.15] tracking-tight"
          style={{ opacity: 0, animationDelay: '0.15s' }}
        >
          흩어진 우리,
          <br />
          <span className="text-brand">공평한 한 곳</span>에서.
        </h1>

        <p
          className="animate-fade-up mt-4 text-[15px] leading-relaxed text-muted"
          style={{ opacity: 0, animationDelay: '0.25s' }}
        >
          각자 출발지만 넣으면, 대중교통으로 모두에게 가장
          공평한 만남 지점과 근처 카페·맛집까지 찾아드려요.
        </p>
      </div>

      <div
        className="animate-fade-up mt-8 space-y-3"
        style={{ opacity: 0, animationDelay: '0.35s' }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="모임 이름 (선택) — 예: 주말 스터디"
          maxLength={50}
          className="h-12 w-full rounded-xl border border-hairline bg-card px-4 text-sm
                     placeholder:text-muted/70 focus:border-brand focus:outline-none
                     focus:ring-2 focus:ring-brand/20"
        />
        <Button
          size="lg"
          className="w-full"
          onClick={onCreate}
          disabled={createRoom.isPending}
        >
          {createRoom.isPending ? '만드는 중…' : '모임 만들기'}
        </Button>
        {createRoom.isError && (
          <p className="text-center text-sm text-spot">
            연결에 실패했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </div>

      <ol className="mt-8 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <li key={s.n} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full font-data text-xs font-bold text-white"
                style={{ backgroundColor: s.color }}
              >
                {s.n}
              </span>
              <span className="whitespace-nowrap text-xs text-muted">
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="mx-1 mb-5 h-0.5 flex-1 rounded-full bg-hairline" />
            )}
          </li>
        ))}
      </ol>
    </main>
  );
}
