import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// 브랜드 파비콘 — 딥잉크 배경 위 코랄 만남 핀
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
          background: '#141A2E',
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 15,
            height: 15,
            borderRadius: 9999,
            background: '#FF5A47',
            border: '3px solid #fff',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
