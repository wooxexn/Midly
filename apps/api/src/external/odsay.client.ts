import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LatLng, RouteLeg } from '@midly/shared';
import { fetchJson } from './http.util';

export interface TransitResult {
  minutes: number;
  transfers: number;
  /** 대중교통 경로를 찾지 못한 경우 */
  noRoute: boolean;
  /** 구간별 상세 경로 */
  legs: RouteLeg[];
}

interface OdsayPathInfo {
  totalTime: number;
  busTransitCount?: number;
  subwayTransitCount?: number;
}

interface OdsaySubPath {
  trafficType: number; // 1 지하철, 2 버스, 3 도보
  sectionTime?: number;
  stationCount?: number;
  startName?: string;
  endName?: string;
  lane?: { name?: string; busNo?: string }[];
}

interface OdsayPath {
  info: OdsayPathInfo;
  subPath?: OdsaySubPath[];
}

interface OdsayResponse {
  result?: {
    path?: OdsayPath[];
  };
  error?: { code?: string; message?: string } | { code?: string }[];
}

/** ODsay subPath를 표시용 구간 목록으로 변환 (0분 도보 구간은 제외) */
function toLegs(subPaths: OdsaySubPath[]): RouteLeg[] {
  return subPaths
    .map((s): RouteLeg => {
      const minutes = Math.round(s.sectionTime ?? 0);
      if (s.trafficType === 3) {
        return { type: 'walk', minutes };
      }
      const isSubway = s.trafficType === 1;
      const lane = s.lane?.[0];
      const line = isSubway
        ? (lane?.name ?? '지하철').replace(/^수도권\s*/, '')
        : lane?.busNo
          ? `${lane.busNo}번`
          : '버스';
      return {
        type: isSubway ? 'subway' : 'bus',
        line,
        from: s.startName,
        to: s.endName,
        minutes,
        stations: s.stationCount,
      };
    })
    .filter((leg) => !(leg.type === 'walk' && leg.minutes === 0));
}

// ODsay 에러 코드: '3' = 출발/도착이 너무 가까움(도보권)
const TOO_CLOSE_CODE = '3';
const WALKABLE_MINUTES = 3;
// 경로 선택 시 환승 1회를 소요시간 몇 분과 동등하게 볼지(페널티). 표시값은 실제 시간·환승.
const TRANSFER_PENALTY_MIN = 5;

function countTransfers(info: OdsayPathInfo): number {
  return Math.max(
    0,
    (info.busTransitCount ?? 0) + (info.subwayTransitCount ?? 0) - 1,
  );
}

@Injectable()
export class OdsayClient {
  private readonly logger = new Logger(OdsayClient.name);
  private readonly baseUrl = 'https://api.odsay.com/v1/api';
  private readonly key: string;
  // ODsay 웹서비스 키는 등록한 URI를 Referer로 검사하므로, 서버 호출 시 이를 맞춰 보낸다.
  private readonly referer: string;

  constructor(config: ConfigService) {
    this.key = config.get<string>('ODSAY_API_KEY') ?? '';
    this.referer =
      config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000';
  }

  /** 출발지 → 도착지 대중교통 소요시간(분)과 환승 횟수 */
  async transitTime(from: LatLng, to: LatLng): Promise<TransitResult> {
    const url =
      `${this.baseUrl}/searchPubTransPathT` +
      `?SX=${from.lng}&SY=${from.lat}&EX=${to.lng}&EY=${to.lat}` +
      `&apiKey=${encodeURIComponent(this.key)}`;

    const data = await fetchJson<OdsayResponse>(url, {
      headers: { Referer: this.referer },
    });

    const paths = data.result?.path;
    if (paths && paths.length > 0) {
      // ODsay는 path 순서를 정렬해주지 않는다. "소요시간 + 환승×페널티"가 최소인 경로를
      // 고르되, 표시값은 그 경로의 실제 시간·환승을 그대로 사용한다.
      const best = paths.reduce((a, b) => {
        const scoreA =
          a.info.totalTime + countTransfers(a.info) * TRANSFER_PENALTY_MIN;
        const scoreB =
          b.info.totalTime + countTransfers(b.info) * TRANSFER_PENALTY_MIN;
        return scoreA <= scoreB ? a : b;
      });
      return {
        minutes: Math.round(best.info.totalTime),
        transfers: countTransfers(best.info),
        noRoute: false,
        legs: toLegs(best.subPath ?? []),
      };
    }

    // 에러 처리
    const errorCode = this.extractErrorCode(data.error);
    if (errorCode === TOO_CLOSE_CODE) {
      // 너무 가까우면 도보권으로 간주
      return {
        minutes: WALKABLE_MINUTES,
        transfers: 0,
        noRoute: false,
        legs: [{ type: 'walk', minutes: WALKABLE_MINUTES }],
      };
    }

    this.logger.warn(
      `ODsay 경로 없음 (code=${errorCode ?? 'unknown'}) ${JSON.stringify(from)}→${JSON.stringify(to)}`,
    );
    return { minutes: 0, transfers: 0, noRoute: true, legs: [] };
  }

  private extractErrorCode(error: OdsayResponse['error']): string | undefined {
    if (!error) return undefined;
    if (Array.isArray(error)) return error[0]?.code;
    return error.code;
  }
}
