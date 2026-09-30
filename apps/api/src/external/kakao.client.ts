import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetchJson } from './http.util';

/** Kakao 카테고리 그룹 코드 */
export const KAKAO_CATEGORY = {
  SUBWAY: 'SW8', // 지하철역
  CAFE: 'CE7', // 카페
  RESTAURANT: 'FD6', // 음식점
} as const;

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_group_code: string;
  category_name: string;
  x: string; // 경도(lng)
  y: string; // 위도(lat)
  place_url: string;
  address_name: string;
  road_address_name: string;
  distance?: string;
}

interface KakaoSearchResponse {
  documents: KakaoPlace[];
}

@Injectable()
export class KakaoClient {
  private readonly baseUrl = 'https://dapi.kakao.com/v2/local';
  private readonly key: string;

  constructor(config: ConfigService) {
    this.key = config.get<string>('KAKAO_REST_API_KEY') ?? '';
  }

  private headers() {
    return { Authorization: `KakaoAK ${this.key}` };
  }

  /** 키워드(장소명/주소)로 검색 */
  async searchKeyword(query: string, size = 10): Promise<KakaoPlace[]> {
    const url =
      `${this.baseUrl}/search/keyword.json` +
      `?query=${encodeURIComponent(query)}&size=${size}`;
    const data = await fetchJson<KakaoSearchResponse>(url, {
      headers: this.headers(),
    });
    return data.documents ?? [];
  }

  /** 좌표 → 주소 라벨 (역지오코딩). 도로명 우선, 없으면 지번, 둘 다 없으면 null */
  async coord2address(lng: number, lat: number): Promise<string | null> {
    const url = `${this.baseUrl}/geo/coord2address.json?x=${lng}&y=${lat}`;
    const data = await fetchJson<{
      documents: {
        road_address?: { address_name: string } | null;
        address?: { address_name: string } | null;
      }[];
    }>(url, { headers: this.headers() });
    const doc = data.documents?.[0];
    return (
      doc?.road_address?.address_name ?? doc?.address?.address_name ?? null
    );
  }

  /** 카테고리(지하철역/카페/음식점)를 좌표 반경 내에서 거리순 검색 */
  async searchCategory(
    categoryCode: string,
    lng: number,
    lat: number,
    radiusMeters: number,
    size = 15,
  ): Promise<KakaoPlace[]> {
    const url =
      `${this.baseUrl}/search/category.json` +
      `?category_group_code=${categoryCode}` +
      `&x=${lng}&y=${lat}&radius=${radiusMeters}&sort=distance&size=${size}`;
    const data = await fetchJson<KakaoSearchResponse>(url, {
      headers: this.headers(),
    });
    return data.documents ?? [];
  }
}
