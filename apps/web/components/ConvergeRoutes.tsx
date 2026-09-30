type Route = {
  d: string;
  color: string;
  origin: { x: number; y: number };
  label?: string;
  delay: number;
};

// 세 갈래 노선이 흩어진 출발지에서 중앙(200,150)의 만남 핀으로 수렴한다.
const ROUTES: Route[] = [
  {
    d: 'M40 46 Q 130 64 200 150',
    color: '#2B44FF',
    origin: { x: 40, y: 46 },
    label: '홍대',
    delay: 0,
  },
  {
    d: 'M372 60 Q 286 74 200 150',
    color: '#12B5A5',
    origin: { x: 372, y: 60 },
    label: '강남',
    delay: 0.18,
  },
  {
    d: 'M64 262 Q 150 212 200 150',
    color: '#F6A609',
    origin: { x: 64, y: 262 },
    label: '잠실',
    delay: 0.36,
  },
  {
    d: 'M360 258 Q 276 212 200 150',
    color: '#7A5CFF',
    origin: { x: 360, y: 258 },
    label: '성수',
    delay: 0.54,
  },
];

export function ConvergeRoutes({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label="흩어진 출발지들이 하나의 만남 지점으로 모이는 그림"
      fill="none"
    >
      {ROUTES.map((r) => (
        <path
          key={r.label}
          d={r.d}
          stroke={r.color}
          strokeWidth={3.5}
          strokeLinecap="round"
          pathLength={1}
          className="animate-route-draw"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            animationDelay: `${r.delay}s`,
          }}
        />
      ))}

      {/* 출발지 노드 + 라벨 */}
      {ROUTES.map((r) => (
        <g
          key={`o-${r.label}`}
          className="animate-fade-up"
          style={{ animationDelay: `${r.delay + 0.1}s`, opacity: 0 }}
        >
          <circle
            cx={r.origin.x}
            cy={r.origin.y}
            r={7}
            fill="white"
            stroke={r.color}
            strokeWidth={3.5}
          />
          {r.label && (
            <text
              x={r.origin.x}
              y={r.origin.y - 14}
              textAnchor="middle"
              className="font-data"
              fontSize={13}
              fontWeight={600}
              fill="#5B6478"
            >
              {r.label}
            </text>
          )}
        </g>
      ))}

      {/* 중앙 만남 핀 (위치 핀) — 노선들이 만나는 지점(200,150)에 핀 끝이 닿는다 */}
      <g>
        {/* 착지 지점 펄스 */}
        <circle
          cx={200}
          cy={150}
          r={11}
          fill="#FF5A47"
          className="animate-pulse-ring"
          style={{ transformOrigin: '200px 150px', animationDelay: '1.1s' }}
          opacity={0.45}
        />
        <g
          className="animate-pin-drop"
          style={{ transformOrigin: '200px 150px', animationDelay: '1s', opacity: 0 }}
        >
          <path
            d="M200 150 C 191 137, 185 131, 185 123 A 15 15 0 1 1 215 123 C 215 131, 209 137, 200 150 Z"
            fill="#FF5A47"
            stroke="white"
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
          <circle cx={200} cy={122} r={5} fill="white" />
        </g>
      </g>
    </svg>
  );
}
