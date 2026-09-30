import type {
  AddParticipantReq,
  ApiErrorRes,
  CreateRoomReq,
  CreateRoomRes,
  GeoReverseResult,
  GeoSearchResult,
  RoomDto,
} from '@midly/shared';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let code = 'UNKNOWN';
    let message = '문제가 발생했어요. 잠시 후 다시 시도해 주세요.';
    try {
      const body = (await res.json()) as ApiErrorRes & { message?: string };
      code = body.code ?? code;
      message = Array.isArray(body.message)
        ? body.message.join(', ')
        : (body.message ?? message);
    } catch {
      /* JSON 파싱 실패는 기본 메시지 유지 */
    }
    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  createRoom: (body: CreateRoomReq) =>
    request<CreateRoomRes>('/rooms', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getRoom: (code: string) => request<RoomDto>(`/rooms/${code}`),

  addParticipant: (code: string, body: AddParticipantReq) =>
    request<RoomDto>(`/rooms/${code}/participants`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  removeParticipant: (code: string, participantId: string) =>
    request<RoomDto>(`/rooms/${code}/participants/${participantId}`, {
      method: 'DELETE',
    }),

  compute: (code: string) =>
    request<RoomDto>(`/rooms/${code}/compute`, { method: 'POST' }),

  geoSearch: (q: string) =>
    request<GeoSearchResult[]>(`/geo/search?q=${encodeURIComponent(q)}`),

  geoReverse: (lat: number, lng: number) =>
    request<GeoReverseResult>(`/geo/reverse?lat=${lat}&lng=${lng}`),
};
