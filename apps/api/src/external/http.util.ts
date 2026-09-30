export interface FetchJsonOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const backoff = (attempt: number) => 200 * Math.pow(2, attempt);

/**
 * 타임아웃 + 재시도(5xx·429·네트워크 오류에 지수 백오프)를 갖춘 JSON fetch.
 */
export async function fetchJson<T>(
  url: string,
  opts: FetchJsonOptions = {},
): Promise<T> {
  const { headers, timeoutMs = 5000, retries = 2 } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timer);

      if (res.status >= 500 || res.status === 429) {
        lastErr = new Error(`HTTP ${res.status}`);
        if (attempt < retries) {
          await delay(backoff(attempt));
          continue;
        }
        throw lastErr;
      }
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${body}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < retries) {
        await delay(backoff(attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
