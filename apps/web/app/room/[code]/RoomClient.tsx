'use client';

import Link from 'next/link';
import { useRoom } from '@/lib/hooks';
import { KakaoMap, type MapPoint } from '@/components/KakaoMap';
import { ShareButton } from '@/components/ShareButton';
import { ConvergeRoutes } from '@/components/ConvergeRoutes';
import { Button } from '@/components/ui/Button';
import { CollectingView } from '@/components/room/CollectingView';
import { ResultView } from '@/components/room/ResultView';
import { participantColor } from '@/lib/colors';

export function RoomClient({ code }: { code: string }) {
  const { data: room, isLoading, isError } = useRoom(code);

  if (isLoading) return <FullLoader />;
  if (isError || !room) return <NotFound />;

  const origins: MapPoint[] = room.participants.map((p, i) => ({
    lat: p.lat,
    lng: p.lng,
    label: p.nickname,
    color: participantColor(i),
  }));
  const spot: MapPoint | null = room.result
    ? {
        lat: room.result.chosen.lat,
        lng: room.result.chosen.lng,
        label: room.result.chosen.name,
      }
    : null;

  return (
    <div className="relative flex h-dvh w-full flex-col md:flex-row">
      {/* 지도 */}
      <div className="relative h-[46dvh] w-full md:h-dvh md:flex-1">
        <KakaoMap origins={origins} spot={spot} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-card/90 px-3.5 py-2 shadow-soft backdrop-blur">
            <Link href="/" className="font-data text-xs font-bold text-brand">
              Midly
            </Link>
            <span className="h-3 w-px bg-hairline" />
            <span className="max-w-[40vw] truncate text-sm font-semibold">
              {room.title ?? '새 모임'}
            </span>
          </div>
          <div className="pointer-events-auto">
            <ShareButton code={code} />
          </div>
        </div>
      </div>

      {/* 시트 / 사이드 패널 */}
      <div
        className="relative z-10 -mt-6 flex flex-1 flex-col overflow-hidden rounded-t-3xl bg-surface
                   shadow-sheet md:mt-0 md:h-dvh md:w-[400px] md:shrink-0 md:rounded-none
                   md:border-l md:border-hairline md:shadow-none"
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-hairline md:hidden" />
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3 safe-b">
          {room.status === 'COMPUTED' && room.result ? (
            <ResultView room={room} code={code} />
          ) : (
            <CollectingView room={room} code={code} />
          )}
        </div>
      </div>
    </div>
  );
}

function FullLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
      <ConvergeRoutes className="w-full max-w-[280px]" />
      <p className="font-data text-sm text-muted">불러오는 중…</p>
    </div>
  );
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="text-5xl">🗺️</span>
      <div>
        <h1 className="text-xl font-bold">모임을 찾을 수 없어요</h1>
        <p className="mt-2 text-sm text-muted">
          링크가 만료되었거나 잘못된 주소예요.
        </p>
      </div>
      <Link href="/">
        <Button size="lg">새 모임 만들기</Button>
      </Link>
    </main>
  );
}
