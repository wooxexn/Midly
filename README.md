# Midly

흩어져 있는 친구들·스터디원들이 **대중교통 이동시간 기준으로 가장 공평하게 모일 수 있는 중간지점**을 찾아주는 서비스.

방을 만들어 링크를 공유하면, 각자 출발지를 입력하고 → 모두에게 공평한 만남 거점과 근처 카페·식당을 추천받습니다. (로그인 불필요)

## 핵심 기능

- 🔗 **방 생성 + 링크 공유** — 로그인 없이 링크로 참여
- 🚇 **이동시간 기반 중간지점** — 대중교통 소요시간이 가장 공평(minimax)해지는 거점 추천
- ⏱️ **각자 이동시간 비교** — 참여자별 소요시간·환승 표시
- ☕ **근처 장소 추천** — 최종 거점 주변 카페·식당
- 📱 **모바일 퍼스트 반응형**

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query |
| 백엔드 | NestJS, Prisma |
| DB | PostgreSQL (Neon) |
| 외부 API | Kakao Maps(지도·장소검색), ODsay(대중교통 경로) |
| 모노레포 | pnpm workspaces + Turborepo |

## 구조

```
midly/
├─ apps/
│  ├─ web/     # Next.js — UI, 지도 렌더링
│  └─ api/     # NestJS — 방 CRUD, 외부 API 호출, 중간지점 계산
└─ packages/
   └─ shared/  # 공유 TypeScript 타입
```

## 개발

```bash
pnpm install
pnpm dev        # web + api 동시 실행
```

환경 변수는 각 앱의 `.env.example`를 참고해 `.env`를 채워주세요. (Kakao / ODsay API 키, DATABASE_URL 등)
