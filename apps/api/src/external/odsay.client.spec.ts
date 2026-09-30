import { ConfigService } from '@nestjs/config';
import { OdsayClient } from './odsay.client';

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

describe('OdsayClient.transitTime', () => {
  const from = { lat: 37.5, lng: 127.0 };
  const to = { lat: 37.55, lng: 126.9 };
  let client: OdsayClient;

  beforeEach(() => {
    client = new OdsayClient({
      get: () => 'test-key',
    } as unknown as ConfigService);
  });

  it('경로가 있으면 소요시간과 환승 횟수를 파싱한다', async () => {
    mockFetchOnce({
      result: {
        path: [
          { info: { totalTime: 42.6, busTransitCount: 1, subwayTransitCount: 1 } },
        ],
      },
    });

    const res = await client.transitTime(from, to);

    expect(res.noRoute).toBe(false);
    expect(res.minutes).toBe(43); // 반올림
    expect(res.transfers).toBe(1); // (1+1) - 1
  });

  it('환승 총합이 1이면 transfers는 0', async () => {
    mockFetchOnce({
      result: { path: [{ info: { totalTime: 20, subwayTransitCount: 1 } }] },
    });
    const res = await client.transitTime(from, to);
    expect(res.transfers).toBe(0);
  });

  it('path[0]이 최단이 아니어도 가장 빠른 경로를 선택한다', async () => {
    // ODsay는 path 순서를 최소시간으로 보장하지 않는다.
    mockFetchOnce({
      result: {
        path: [
          { info: { totalTime: 88, busTransitCount: 1, subwayTransitCount: 4 } },
          { info: { totalTime: 82, busTransitCount: 2, subwayTransitCount: 0 } },
        ],
      },
    });
    const res = await client.transitTime(from, to);
    expect(res.minutes).toBe(82); // path[1]이 더 빠름
    expect(res.transfers).toBe(1); // 그 경로 기준 (2대 - 1)
  });

  it('시간이 조금 짧아도 환승이 많으면 페널티로 걸러진다', async () => {
    // A: 40분 환승3 (점수 40+15=55) vs B: 46분 환승0 (점수 46) → B 선택
    mockFetchOnce({
      result: {
        path: [
          { info: { totalTime: 40, busTransitCount: 0, subwayTransitCount: 4 } },
          { info: { totalTime: 46, busTransitCount: 0, subwayTransitCount: 1 } },
        ],
      },
    });
    const res = await client.transitTime(from, to);
    expect(res.minutes).toBe(46);
    expect(res.transfers).toBe(0);
  });

  it('subPath를 구간(legs)으로 파싱한다 (수도권 접두어 제거·버스번호·0분 도보 제외)', async () => {
    mockFetchOnce({
      result: {
        path: [
          {
            info: { totalTime: 30, subwayTransitCount: 2 },
            subPath: [
              { trafficType: 3, sectionTime: 3 },
              {
                trafficType: 1,
                sectionTime: 12,
                stationCount: 6,
                startName: '강남',
                endName: '사당',
                lane: [{ name: '수도권 2호선' }],
              },
              {
                trafficType: 2,
                sectionTime: 10,
                stationCount: 4,
                startName: '사당',
                endName: '이촌',
                lane: [{ busNo: '761' }],
              },
              { trafficType: 3, sectionTime: 0 },
            ],
          },
        ],
      },
    });
    const res = await client.transitTime(from, to);
    expect(res.legs).toEqual([
      { type: 'walk', minutes: 3 },
      { type: 'subway', line: '2호선', from: '강남', to: '사당', minutes: 12, stations: 6 },
      { type: 'bus', line: '761번', from: '사당', to: '이촌', minutes: 10, stations: 4 },
    ]);
  });

  it('경로가 없으면 noRoute=true', async () => {
    mockFetchOnce({ error: { code: '-98', message: '경로 없음' } });
    const res = await client.transitTime(from, to);
    expect(res.noRoute).toBe(true);
  });

  it('너무 가까우면(code=3) 도보권으로 처리한다', async () => {
    mockFetchOnce({ error: { code: '3', message: 'too close' } });
    const res = await client.transitTime(from, to);
    expect(res.noRoute).toBe(false);
    expect(res.minutes).toBeGreaterThan(0);
    expect(res.transfers).toBe(0);
  });
});
