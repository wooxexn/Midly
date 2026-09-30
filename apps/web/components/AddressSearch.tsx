'use client';

import { useEffect, useRef, useState } from 'react';
import type { GeoSearchResult } from '@midly/shared';
import { api } from '@/lib/api';

export function AddressSearch({
  onSelect,
  placeholder = '출발지 검색 (예: 강남역, 우리집 주소)',
}: {
  onSelect: (r: GeoSearchResult) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<GeoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await api.geoSearch(query);
        setResults(r);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const pick = (r: GeoSearchResult) => {
    onSelect(r);
    setQ('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-hairline bg-card px-4 text-sm
                   placeholder:text-muted/70 focus:border-brand focus:outline-none
                   focus:ring-2 focus:ring-brand/20"
      />
      {loading && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-data text-xs text-muted">
          검색 중…
        </span>
      )}
      {open && results.length > 0 && (
        <ul
          className="absolute bottom-full z-30 mb-2 max-h-60 w-full overflow-y-auto
                     rounded-xl border border-hairline bg-card p-1 shadow-card"
        >
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lng}-${i}`}>
              <button
                type="button"
                onClick={() => pick(r)}
                className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left
                           hover:bg-brand-soft"
              >
                <span className="text-sm font-medium text-ink">{r.name}</span>
                {r.address && (
                  <span className="text-xs text-muted">{r.address}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && results.length === 0 && q.trim().length > 0 && (
        <div
          className="absolute bottom-full z-30 mb-2 w-full rounded-xl border border-hairline
                     bg-card px-3 py-3 text-sm text-muted shadow-card"
        >
          검색 결과가 없어요. 다른 키워드로 시도해 보세요.
        </div>
      )}
    </div>
  );
}
