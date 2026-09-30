import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Midly — 공평한 중간지점 찾기';

// 이미지에 쓰는 모든 글자 (Google Fonts 서브셋용)
const TEXT =
  'MIDLY 흩어진 우리, 공평한 한 곳에서. 대중교통으로 모두에게 가장 공평한 만날 곳.';

async function loadKoreanFont(): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(
      TEXT,
    )}`;
    const css = await (await fetch(url)).text();
    const src = css.match(
      /src: url\((.+?)\) format\('(opentype|truetype)'\)/,
    );
    if (!src) return null;
    const res = await fetch(src[1]);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const fontData = await loadKoreanFont();
  const ko = !!fontData;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F4F6FA',
          padding: 80,
          fontFamily: ko ? 'NotoSansKR' : 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 9999,
              background: '#FF5A47',
              border: '6px solid #fff',
            }}
          />
          <span style={{ fontSize: 32, letterSpacing: 8, color: '#141A2E' }}>
            MIDLY
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ko ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: 72,
                color: '#141A2E',
                lineHeight: 1.2,
              }}
            >
              <span>흩어진 우리,</span>
              <span>
                <span style={{ color: '#2B44FF' }}>공평한 한 곳</span>에서.
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 80, color: '#141A2E' }}>
              The fair place to meet.
            </div>
          )}
          <div style={{ fontSize: 32, color: '#5B6478', marginTop: 24 }}>
            {ko
              ? '대중교통으로 모두에게 가장 공평한 만날 곳.'
              : 'Scattered friends, one fair spot — by transit time.'}
          </div>
        </div>

        {/* 수렴 노선 모티프 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 16, height: 16, borderRadius: 9999, background: '#2B44FF' }} />
          <div style={{ width: 140, height: 5, borderRadius: 9999, background: '#2B44FF55' }} />
          <div style={{ width: 16, height: 16, borderRadius: 9999, background: '#12B5A5' }} />
          <div style={{ width: 140, height: 5, borderRadius: 9999, background: '#12B5A555' }} />
          <div style={{ width: 16, height: 16, borderRadius: 9999, background: '#F6A609' }} />
          <div style={{ width: 140, height: 5, borderRadius: 9999, background: '#F6A60955' }} />
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9999,
              background: '#FF5A47',
              border: '6px solid #fff',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'NotoSansKR', data: fontData, weight: 700, style: 'normal' }]
        : [],
    },
  );
}
