import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// 브랜드 파비콘 — 투명 배경 위 코랄 위치 핀 (밝은 톤 디자인과 통일)
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <div
          style={{
            width: 21,
            height: 21,
            background: '#FF5A47',
            borderRadius: '11px 11px 0 11px',
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
