'use client';

import { useState } from 'react';
import type { ResultDto, RoomDto, TravelDto } from '@midly/shared';
import { AddParticipantForm } from '@/components/room/AddParticipantForm';
import { participantColor } from '@/lib/colors';

export function ResultView({ room, code }: { room: RoomDto; code: string }) {
  const [addOpen, setAddOpen] = useState(false);
  const result = room.result as ResultDto;

  const colorByParticipant = new Map(
    room.participants.map((p, i) => [p.id, participantColor(i)]),
  );

  const reachable = result.travels.filter((t) => !t.noRoute);
  const maxMinutes = Math.max(1, ...reachable.map((t) => t.minutes));
  const sorted = [...result.travels].sort((a, b) => {
    if (a.noRoute) return 1;
    if (b.noRoute) return -1;
    return a.minutes - b.minutes;
  });

  const cafes = result.places.filter((p) => p.category === '카페');
  const restaurants = result.places.filter((p) => p.category === '음식점');

  return (
    <div className="flex flex-col gap-7">
      {/* 결정된 거점 */}
      <section
        className="animate-fade-up rounded-2xl bg-spot-soft px-5 py-5"
        style={{ opacity: 0 }}
      >
        <span className="eyebrow text-spot/80">여기서 만나요</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">
            {result.chosen.name}
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          대중교통 기준 모두에게 가장 공평한 지점이에요.
        </p>
      </section>

      {/* 각자 이동시간 */}
      <section>
        <h3 className="mb-3 text-base font-bold">각자 얼마나 걸려요?</h3>
        <ul className="flex flex-col gap-3.5">
          {sorted.map((t) => (
            <TravelRow
              key={t.participantId}
              travel={t}
              color={colorByParticipant.get(t.participantId) ?? '#2B44FF'}
              maxMinutes={maxMinutes}
            />
          ))}
        </ul>
      </section>

      {/* 근처 장소 */}
      {result.places.length > 0 && (
        <section>
          <h3 className="mb-3 text-base font-bold">근처에서 만나요</h3>
          <div className="flex flex-col gap-4">
            {cafes.length > 0 && (
              <PlaceGroup icon="☕" title="카페" places={cafes} accent="#12B5A5" />
            )}
            {restaurants.length > 0 && (
              <PlaceGroup
                icon="🍽"
                title="음식점"
                places={restaurants}
                accent="#F6A609"
              />
            )}
          </div>
        </section>
      )}

      {/* 새로 합류 */}
      <section className="border-t border-hairline pt-5">
        {!addOpen ? (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="w-full text-center text-sm font-semibold text-brand"
          >
            + 늦게 합류하기 (추가하면 다시 계산돼요)
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="eyebrow">늦게 합류</span>
            <AddParticipantForm code={code} />
          </div>
        )}
      </section>
    </div>
  );
}

function TravelRow({
  travel,
  color,
  maxMinutes,
}: {
  travel: TravelDto;
  color: string;
  maxMinutes: number;
}) {
  const [open, setOpen] = useState(false);
  const hasLegs = !travel.noRoute && (travel.legs?.length ?? 0) > 0;
  const pct = travel.noRoute
    ? 0
    : Math.max(8, Math.round((travel.minutes / maxMinutes) * 100));

  return (
    <li>
      <button
        type="button"
        onClick={() => hasLegs && setOpen((v) => !v)}
        disabled={!hasLegs}
        aria-expanded={hasLegs ? open : undefined}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold">{travel.nickname}</span>
          {hasLegs && (
            <span
              className={`text-[10px] text-muted transition-transform ${open ? 'rotate-180' : ''}`}
            >
              ▾
            </span>
          )}
        </div>
        {travel.noRoute ? (
          <span className="text-sm font-medium text-spot">경로 없음</span>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="font-data text-xl font-bold leading-none">
              {travel.minutes}
              <span className="ml-0.5 text-sm font-medium text-muted">분</span>
            </span>
            <span className="font-data text-xs text-muted">
              환승 {travel.transfers}
            </span>
          </div>
        )}
      </button>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {open && hasLegs && <LegList legs={travel.legs!} color={color} />}
    </li>
  );
}

function LegList({
  legs,
  color,
}: {
  legs: NonNullable<TravelDto['legs']>;
  color: string;
}) {
  const icon = (type: string) =>
    type === 'walk' ? '🚶' : type === 'bus' ? '🚌' : '🚇';

  return (
    <ul
      className="ml-1 mt-3 flex flex-col gap-2.5 border-l-2 pl-3.5"
      style={{ borderColor: `${color}33` }}
    >
      {legs.map((leg, i) => (
        <li key={i} className="flex items-start gap-2 text-xs leading-snug">
          <span className="mt-px shrink-0">{icon(leg.type)}</span>
          {leg.type === 'walk' ? (
            <span className="text-muted">
              도보 <span className="font-data font-semibold text-ink">{leg.minutes}분</span>
            </span>
          ) : (
            <span className="text-ink">
              <span className="font-semibold">{leg.line}</span>
              {leg.from && leg.to && (
                <span className="text-muted">
                  {' '}
                  · {leg.from} → {leg.to}
                </span>
              )}
              {leg.stations ? (
                <span className="text-muted"> ({leg.stations}정거장)</span>
              ) : null}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function PlaceGroup({
  icon,
  title,
  places,
  accent,
}: {
  icon: string;
  title: string;
  places: ResultDto['places'];
  accent: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <span>{icon}</span>
        <span
          className="font-data text-xs font-semibold uppercase tracking-wider"
          style={{ color: accent }}
        >
          {title}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {places.map((p, i) => (
          <li key={`${p.name}-${i}`}>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-soft
                         transition hover:shadow-card active:scale-[0.99]"
            >
              <span className="truncate text-sm font-medium">{p.name}</span>
              <span className="ml-3 shrink-0 text-xs font-semibold text-brand">
                지도 보기 ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
