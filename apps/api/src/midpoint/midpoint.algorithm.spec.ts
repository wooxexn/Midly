import {
  centroid,
  chooseBestIndex,
  compareScores,
  scoreCandidate,
} from './midpoint.algorithm';
import type { TravelDto } from '@midly/shared';

function travels(
  ...specs: [minutes: number, noRoute?: boolean][]
): TravelDto[] {
  return specs.map(([minutes, noRoute], i) => ({
    participantId: `p${i}`,
    nickname: `p${i}`,
    minutes,
    transfers: 0,
    noRoute,
  }));
}

describe('centroid', () => {
  it('좌표 평균을 계산한다', () => {
    const c = centroid([
      { lat: 0, lng: 0 },
      { lat: 2, lng: 4 },
    ]);
    expect(c).toEqual({ lat: 1, lng: 2 });
  });

  it('빈 배열이면 예외', () => {
    expect(() => centroid([])).toThrow();
  });
});

describe('scoreCandidate', () => {
  it('최대/평균 시간과 경로없음 수를 계산한다', () => {
    const s = scoreCandidate(travels([10], [30], [20]));
    expect(s.noRouteCount).toBe(0);
    expect(s.maxMinutes).toBe(30);
    expect(s.meanMinutes).toBe(20);
  });

  it('경로없음 참여자는 평균/최대에서 제외한다', () => {
    const s = scoreCandidate(travels([10], [50, true]));
    expect(s.noRouteCount).toBe(1);
    expect(s.maxMinutes).toBe(10);
    expect(s.meanMinutes).toBe(10);
  });

  it('모두 경로없음이면 무한대', () => {
    const s = scoreCandidate(travels([0, true], [0, true]));
    expect(s.maxMinutes).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('compareScores', () => {
  it('경로없음이 적은 쪽을 우선한다', () => {
    const a = { noRouteCount: 0, maxMinutes: 100, meanMinutes: 100 };
    const b = { noRouteCount: 1, maxMinutes: 10, meanMinutes: 10 };
    expect(compareScores(a, b)).toBeLessThan(0);
  });

  it('경로없음이 같으면 최대시간이 적은 쪽(minimax)을 우선한다', () => {
    const a = { noRouteCount: 0, maxMinutes: 30, meanMinutes: 25 };
    const b = { noRouteCount: 0, maxMinutes: 40, meanMinutes: 10 };
    expect(compareScores(a, b)).toBeLessThan(0);
  });

  it('최대시간이 같으면 평균으로 tie-break', () => {
    const a = { noRouteCount: 0, maxMinutes: 30, meanMinutes: 20 };
    const b = { noRouteCount: 0, maxMinutes: 30, meanMinutes: 25 };
    expect(compareScores(a, b)).toBeLessThan(0);
  });
});

describe('chooseBestIndex (minimax)', () => {
  it('총합이 작아도 최대시간이 큰 후보보다 공평한 후보를 고른다', () => {
    // 후보0: [10, 50] max=50, sum=60
    // 후보1: [30, 32] max=32, sum=62  ← 더 공평 (minimax)
    const best = chooseBestIndex([
      travels([10], [50]),
      travels([30], [32]),
    ]);
    expect(best).toBe(1);
  });

  it('경로없음이 있는 후보를 피한다', () => {
    const best = chooseBestIndex([
      travels([10], [10, true]), // 한 명 경로없음
      travels([25], [25]), // 모두 도달 가능
    ]);
    expect(best).toBe(1);
  });

  it('동점이면 평균이 낮은 후보를 고른다', () => {
    const best = chooseBestIndex([
      travels([30], [10]), // max=30, mean=20
      travels([30], [28]), // max=30, mean=29
    ]);
    expect(best).toBe(0);
  });
});
