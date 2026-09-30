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
