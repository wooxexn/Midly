/**
 * Midly 공유 타입 — 프론트(web)와 백엔드(api)가 동일하게 사용한다.
 */

/** 방 상태 */
export type RoomStatus = 'COLLECTING' | 'COMPUTED';

/** 좌표 */
export interface LatLng {
  lat: number;
  lng: number;
}

/** 추천 장소 카테고리 */
export type PlaceCategory = '카페' | '음식점';

// ── 참여자 ──────────────────────────────────────────────

export interface ParticipantDto {
  id: string;
  nickname: string;
  /** 사용자가 입력한 출발지 텍스트 (예: "강남역") */
  originLabel: string;
  lat: number;
  lng: number;
}

/** 참여자 추가 요청 */
export interface AddParticipantReq {
  nickname: string;
  originLabel: string;
  lat: number;
  lng: number;
}

// ── 방 ─────────────────────────────────────────────────

/** 방 생성 요청 */
export interface CreateRoomReq {
  title?: string;
}

/** 방 생성 응답 */
export interface CreateRoomRes {
  code: string;
}

/** 방 상세 (참여자 + 결과) */
export interface RoomDto {
  code: string;
  title: string | null;
  status: RoomStatus;
  participants: ParticipantDto[];
  result: ResultDto | null;
  createdAt: string;
  expiresAt: string;
}

// ── 계산 결과 ───────────────────────────────────────────

/** 참여자별 이동시간 */
export interface TravelDto {
  participantId: string;
  nickname: string;
  minutes: number;
  transfers: number;
  /** 대중교통 경로를 찾지 못한 경우 true */
  noRoute?: boolean;
}

/** 근처 추천 장소 */
export interface PlaceDto {
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  /** Kakao 장소 상세 URL */
  url: string;
}

/** 중간지점 계산 결과 */
export interface ResultDto {
  /** 참고용 지리적 중심 */
  center: LatLng;
  /** 최종 추천 거점 (예: "홍대입구역") */
  chosen: {
    name: string;
    lat: number;
    lng: number;
  };
  travels: TravelDto[];
  places: PlaceDto[];
}

// ── 주소/장소 검색 (geo/search 프록시) ──────────────────

/** 주소/장소 검색 결과 항목 */
export interface GeoSearchResult {
  /** 장소명 또는 주소 */
  name: string;
  /** 상세 주소 */
  address: string;
  lat: number;
  lng: number;
}

// ── 에러 응답 (표준) ────────────────────────────────────

export interface ApiErrorRes {
  code: string;
  message: string;
}
