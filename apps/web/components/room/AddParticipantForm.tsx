'use client';

import { useState } from 'react';
import type { GeoSearchResult } from '@midly/shared';
import { AddressSearch } from '@/components/AddressSearch';
import { api } from '@/lib/api';
import { useAddParticipant } from '@/lib/hooks';

export function AddParticipantForm({ code }: { code: string }) {
  const [nickname, setNickname] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const add = useAddParticipant(code);

  const requireNickname = () => {
    if (!nickname.trim()) {
      setHint('닉네임을 먼저 입력해 주세요.');
      return false;
    }
    setHint(null);
    return true;
  };

  const onSelect = (r: GeoSearchResult) => {
    if (!requireNickname()) return;
    add.mutate(
      { nickname: nickname.trim(), originLabel: r.name, lat: r.lat, lng: r.lng },
      { onSuccess: () => setNickname('') },
    );
  };

  const useCurrentLocation = () => {
    if (!requireNickname()) return;
    if (!('geolocation' in navigator)) {
      setHint('이 기기에서는 위치를 쓸 수 없어요. 주소로 검색해 주세요.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const { label } = await api.geoReverse(lat, lng);
          add.mutate(
            { nickname: nickname.trim(), originLabel: label, lat, lng },
            { onSuccess: () => setNickname('') },
          );
        } catch {
          setHint('위치 주소를 가져오지 못했어요. 주소로 검색해 주세요.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setHint(
          err.code === err.PERMISSION_DENIED
            ? '위치 권한이 거부됐어요. 주소로 검색해 주세요.'
            : '위치를 가져오지 못했어요. 주소로 검색해 주세요.',
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임 (예: 우선)"
        maxLength={20}
        className="h-12 w-full rounded-xl border border-hairline bg-card px-4 text-sm
                   placeholder:text-muted/70 focus:border-brand focus:outline-none
                   focus:ring-2 focus:ring-brand/20"
      />
      <AddressSearch onSelect={onSelect} />
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating || add.isPending}
        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-hairline
                   bg-card text-sm font-semibold text-brand transition hover:bg-brand-soft
                   disabled:opacity-50 active:scale-[0.99]"
      >
        {locating ? '위치 확인 중…' : '📍 현재 위치로 추가'}
      </button>
      {hint && <p className="text-sm text-spot">{hint}</p>}
      {add.isError && (
        <p className="text-sm text-spot">
          추가에 실패했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
