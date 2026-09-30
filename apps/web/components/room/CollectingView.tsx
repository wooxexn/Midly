'use client';

import {
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS_TO_COMPUTE,
  type RoomDto,
} from '@midly/shared';
import { Button } from '@/components/ui/Button';
import { ConvergeRoutes } from '@/components/ConvergeRoutes';
import { AddParticipantForm } from '@/components/room/AddParticipantForm';
import { useCompute, useRemoveParticipant } from '@/lib/hooks';
import { participantColor } from '@/lib/colors';

export function CollectingView({
  room,
  code,
}: {
  room: RoomDto;
  code: string;
}) {
  const remove = useRemoveParticipant(code);
  const compute = useCompute(code);

  const full = room.participants.length >= MAX_PARTICIPANTS;
  const canCompute =
    room.participants.length >= MIN_PARTICIPANTS_TO_COMPUTE &&
    !compute.isPending;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-bold">누가 모여요?</h2>
          <span className="font-data text-sm text-muted">
            {room.participants.length}
            <span className="text-muted/60">/{MAX_PARTICIPANTS}</span>
          </span>
        </div>

        {room.participants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-hairline px-4 py-6 text-center text-sm text-muted">
            아직 아무도 없어요.
            <br />
            닉네임과 출발지를 넣어 첫 참여자가 되어 보세요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {room.participants.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-soft"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: participantColor(i) }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.nickname}</p>
                  <p className="truncate text-xs text-muted">{p.originLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove.mutate(p.id)}
                  aria-label={`${p.nickname} 삭제`}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted
                             transition hover:bg-hairline/70 hover:text-ink"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!full && (
        <section className="flex flex-col gap-2">
          <span className="eyebrow">출발지 추가</span>
          <AddParticipantForm code={code} />
        </section>
      )}

      <section className="mt-2">
        <Button
          size="lg"
          className="w-full"
          onClick={() => compute.mutate()}
          disabled={!canCompute}
        >
          중간지점 찾기
        </Button>
        {room.participants.length < MIN_PARTICIPANTS_TO_COMPUTE && (
          <p className="mt-2 text-center text-xs text-muted">
            최소 {MIN_PARTICIPANTS_TO_COMPUTE}명이 모이면 찾을 수 있어요.
          </p>
        )}
        {compute.isError && (
          <p className="mt-2 text-center text-sm text-spot">
            계산에 실패했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </section>

      {compute.isPending && <CalculatingOverlay />}
    </div>
  );
}

function CalculatingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-surface/92 backdrop-blur-sm">
      <ConvergeRoutes className="w-full max-w-[300px]" />
      <p className="font-data text-sm font-medium text-muted">
        가장 공평한 지점을 찾는 중…
      </p>
    </div>
  );
}
