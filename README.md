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
| 프론트엔드 | Next.js 15 (App Router), TypeScript, Tailwind CSS, TanStack Query |
| 백엔드 | NestJS 10, Prisma |
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

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. API 키 발급

| 키 | 용도 | 발급처 |
|---|---|---|
| Kakao **JavaScript** 키 | 프론트 지도 렌더링 | [developers.kakao.com](https://developers.kakao.com) → 내 애플리케이션 → 앱 키. **플랫폼 → Web에 `http://localhost:3000` 등록** 필요 |
| Kakao **REST API** 키 | 주소·장소 검색(백엔드) | 같은 앱의 REST API 키 |
| **ODsay** 키 | 대중교통 소요시간 | [lab.odsay.com](https://lab.odsay.com) → 회원가입 → API 신청 |

### 3. 환경 변수

`apps/api/.env` (예시는 `apps/api/.env.example`):

```
PORT=4000
WEB_ORIGIN=http://localhost:3000
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://.../neondb?sslmode=require"
KAKAO_REST_API_KEY=발급받은_REST_키
ODSAY_API_KEY=발급받은_ODsay_키
```

`apps/web/.env.local`:

```
NEXT_PUBLIC_KAKAO_MAP_KEY=발급받은_JavaScript_키
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### 4. DB 마이그레이션

```bash
pnpm --filter api exec prisma migrate deploy   # 기존 마이그레이션 적용
# 또는 스키마 변경 시: pnpm --filter api exec prisma migrate dev
```

### 5. 개발 서버 실행

```bash
pnpm dev        # web(:3000) + api(:4000) 동시 실행
```

## 스크립트

```bash
pnpm build      # 전체 빌드 (turbo)
pnpm test       # 전체 테스트
pnpm typecheck  # 타입 체크
```

## 배포 (권장)

- **web** → Vercel (`NEXT_PUBLIC_*` 환경 변수 설정)
- **api** → Railway/Render (`.env` 값 설정, `prisma migrate deploy`)
- **DB** → Neon (서버리스 Postgres)
