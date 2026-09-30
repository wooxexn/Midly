'use client';

import { useState } from 'react';
import type { GeoSearchResult } from '@midly/shared';
import { AddressSearch } from '@/components/AddressSearch';
import { useAddParticipant } from '@/lib/hooks';

export function AddParticipantForm({ code }: { code: string }) {
  const [nickname, setNickname] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const add = useAddParticipant(code);

  const onSelect = (r: GeoSearchResult) => {
    if (!nickname.trim()) {
      setHint('닉네임을 먼저 입력해 주세요.');
      return;
    }
    setHint(null);
    add.mutate(
      { nickname: nickname.trim(), originLabel: r.name, lat: r.lat, lng: r.lng },
      { onSuccess: () => setNickname('') },
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
      {hint && <p className="text-sm text-spot">{hint}</p>}
      {add.isError && (
        <p className="text-sm text-spot">
          추가에 실패했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
