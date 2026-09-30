import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Midly — 공평한 중간지점 찾기';

// 카카오톡·SNS 공유 시 뜨는 브랜드 카드. (라틴 텍스트만 사용 — 기본 폰트로 안정 렌더)
export default function OpengraphImage() {
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
          fontFamily: 'sans-serif',
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
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: 8,
              color: '#141A2E',
            }}
          >
            MIDLY
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 80, fontWeight: 800, color: '#141A2E' }}>
            The fair place to meet.
          </div>
          <div style={{ fontSize: 34, color: '#5B6478', marginTop: 20 }}>
            Scattered friends, one fair spot — by transit time.
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
    { ...size },
  );
}
