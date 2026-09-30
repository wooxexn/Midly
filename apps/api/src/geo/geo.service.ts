import { Injectable } from '@nestjs/common';
import type { GeoReverseResult, GeoSearchResult } from '@midly/shared';
import { KakaoClient } from '../external/kakao.client';

@Injectable()
export class GeoService {
  constructor(private readonly kakao: KakaoClient) {}

  /** 주소/장소 검색 → 좌표 후보 목록 */
  async search(query: string): Promise<GeoSearchResult[]> {
    const q = query?.trim();
    if (!q) return [];

    const places = await this.kakao.searchKeyword(q);
    return places.map((p) => ({
      name: p.place_name,
      address: p.road_address_name || p.address_name,
      lat: Number(p.y),
      lng: Number(p.x),
    }));
  }

  /** 좌표 → 주소 라벨 (현재 위치용) */
  async reverse(lat: number, lng: number): Promise<GeoReverseResult> {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return { label: '내 위치' };
    }
    const label = await this.kakao.coord2address(lng, lat);
    return { label: label ?? '내 위치' };
  }
}
