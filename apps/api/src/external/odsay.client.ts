import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LatLng } from '@midly/shared';
import { fetchJson } from './http.util';

export interface TransitResult {
  minutes: number;
  transfers: number;
  /** 대중교통 경로를 찾지 못한 경우 */
  noRoute: boolean;
}

interface OdsayPathInfo {
  totalTime: number;
  busTransitCount?: number;
  subwayTransitCount?: number;
}

interface OdsayResponse {
  result?: {
    path?: { info: OdsayPathInfo }[];
  };
  error?: { code?: string; message?: string } | { code?: string }[];
}

// ODsay 에러 코드: '3' = 출발/도착이 너무 가까움(도보권)
const TOO_CLOSE_CODE = '3';
const WALKABLE_MINUTES = 3;

@Injectable()
export class OdsayClient {
  private readonly logger = new Logger(OdsayClient.name);
  private readonly baseUrl = 'https://api.odsay.com/v1/api';
  private readonly key: string;

  constructor(config: ConfigService) {
    this.key = config.get<string>('ODSAY_API_KEY') ?? '';
  }

  /** 출발지 → 도착지 대중교통 소요시간(분)과 환승 횟수 */
  async transitTime(from: LatLng, to: LatLng): Promise<TransitResult> {
    const url =
      `${this.baseUrl}/searchPubTransPathT` +
      `?SX=${from.lng}&SY=${from.lat}&EX=${to.lng}&EY=${to.lat}` +
      `&apiKey=${encodeURIComponent(this.key)}`;

    const data = await fetchJson<OdsayResponse>(url);

    const path = data.result?.path;
    if (path && path.length > 0) {
      const info = path[0].info;
      const transfers = Math.max(
        0,
        (info.busTransitCount ?? 0) + (info.subwayTransitCount ?? 0) - 1,
      );
      return { minutes: Math.round(info.totalTime), transfers, noRoute: false };
    }

    // 에러 처리
    const errorCode = this.extractErrorCode(data.error);
    if (errorCode === TOO_CLOSE_CODE) {
      // 너무 가까우면 도보권으로 간주
      return { minutes: WALKABLE_MINUTES, transfers: 0, noRoute: false };
    }

    this.logger.warn(
      `ODsay 경로 없음 (code=${errorCode ?? 'unknown'}) ${JSON.stringify(from)}→${JSON.stringify(to)}`,
    );
    return { minutes: 0, transfers: 0, noRoute: true };
  }

  private extractErrorCode(error: OdsayResponse['error']): string | undefined {
    if (!error) return undefined;
    if (Array.isArray(error)) return error[0]?.code;
    return error.code;
  }
}
