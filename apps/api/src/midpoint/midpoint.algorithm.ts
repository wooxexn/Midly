import type { LatLng, TravelDto } from '@midly/shared';

/** 좌표들의 지리적 중심(centroid) */
export function centroid(points: LatLng[]): LatLng {
  const n = points.length;
  if (n === 0) throw new Error('centroid: 빈 좌표 배열');
  const lat = points.reduce((s, p) => s + p.lat, 0) / n;
  const lng = points.reduce((s, p) => s + p.lng, 0) / n;
  return { lat, lng };
}

export interface CandidateScore {
  /** 경로를 못 찾은 참여자 수 */
  noRouteCount: number;
  /** 도달 가능한 참여자 중 최대 소요시간 (공평성 핵심) */
  maxMinutes: number;
  /** 도달 가능한 참여자 평균 소요시간 (동점 시 tie-break) */
  meanMinutes: number;
}

/** 한 후보 거점에 대한 참여자별 이동시간을 점수로 환산 */
export function scoreCandidate(travels: TravelDto[]): CandidateScore {
  const reachable = travels.filter((t) => !t.noRoute);
  const noRouteCount = travels.length - reachable.length;

  if (reachable.length === 0) {
    return {
      noRouteCount,
      maxMinutes: Number.POSITIVE_INFINITY,
      meanMinutes: Number.POSITIVE_INFINITY,
    };
  }

  const minutes = reachable.map((t) => t.minutes);
  const maxMinutes = Math.max(...minutes);
  const meanMinutes =
    minutes.reduce((a, b) => a + b, 0) / minutes.length;

  return { noRouteCount, maxMinutes, meanMinutes };
}

/**
 * 점수 비교 (작을수록 좋음).
 * 우선순위: 경로없음 적은 순 → 최대시간 적은 순(minimax) → 평균시간 적은 순.
 */
export function compareScores(a: CandidateScore, b: CandidateScore): number {
  if (a.noRouteCount !== b.noRouteCount) {
    return a.noRouteCount - b.noRouteCount;
  }
  if (a.maxMinutes !== b.maxMinutes) {
    return a.maxMinutes - b.maxMinutes;
  }
  return a.meanMinutes - b.meanMinutes;
}

/**
 * 후보별 참여자 이동시간 행렬에서 가장 공평한 후보의 인덱스를 고른다.
 * (minimax: 가장 오래 걸리는 사람의 시간을 최소화)
 */
export function chooseBestIndex(candidateTravels: TravelDto[][]): number {
  if (candidateTravels.length === 0) {
    throw new Error('chooseBestIndex: 후보 없음');
  }
  let bestIdx = 0;
  let bestScore = scoreCandidate(candidateTravels[0]);
  for (let i = 1; i < candidateTravels.length; i++) {
    const score = scoreCandidate(candidateTravels[i]);
    if (compareScores(score, bestScore) < 0) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}
