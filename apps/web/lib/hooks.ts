'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { AddParticipantReq, RoomDto } from '@midly/shared';
import { api } from './api';

const roomKey = (code: string) => ['room', code] as const;

/** 방 상태 조회 — 창 포커스 시 + 5초 폴링으로 "거의 실시간" 반영 */
export function useRoom(code: string) {
  return useQuery({
    queryKey: roomKey(code),
    queryFn: () => api.getRoom(code),
    refetchInterval: (query) =>
      query.state.data?.status === 'COMPUTED' ? false : 5000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateRoom() {
  return useMutation({
    mutationFn: (title?: string) => api.createRoom({ title }),
  });
}

export function useAddParticipant(code: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddParticipantReq) => api.addParticipant(code, body),
    // 서버 응답을 기다리지 않고 목록에 즉시 반영한다 (체감 지연 제거).
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: roomKey(code) });
      const prev = qc.getQueryData<RoomDto>(roomKey(code));
      if (prev) {
        const optimistic: RoomDto = {
          ...prev,
          participants: [
            ...prev.participants,
            {
              id: `temp-${Date.now()}`,
              nickname: body.nickname,
              originLabel: body.originLabel,
              lat: body.lat,
              lng: body.lng,
            },
          ],
          // 참여자가 바뀌면 결과 무효화 (서버 로직과 동일하게)
          status: prev.status === 'COMPUTED' ? 'COLLECTING' : prev.status,
          result: prev.status === 'COMPUTED' ? null : prev.result,
        };
        qc.setQueryData<RoomDto>(roomKey(code), optimistic);
      }
      return { prev };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.prev) qc.setQueryData<RoomDto>(roomKey(code), ctx.prev);
    },
    onSuccess: (room) => qc.setQueryData<RoomDto>(roomKey(code), room),
  });
}

export function useRemoveParticipant(code: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (participantId: string) =>
      api.removeParticipant(code, participantId),
    // 삭제도 즉시 반영 후 서버와 동기화.
    onMutate: async (participantId) => {
      await qc.cancelQueries({ queryKey: roomKey(code) });
      const prev = qc.getQueryData<RoomDto>(roomKey(code));
      if (prev) {
        qc.setQueryData<RoomDto>(roomKey(code), {
          ...prev,
          participants: prev.participants.filter(
            (p) => p.id !== participantId,
          ),
        });
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData<RoomDto>(roomKey(code), ctx.prev);
    },
    onSuccess: (room) => qc.setQueryData<RoomDto>(roomKey(code), room),
  });
}

export function useCompute(code: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.compute(code),
    onSuccess: (room) => qc.setQueryData<RoomDto>(roomKey(code), room),
  });
}
