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
    onSuccess: (room) => qc.setQueryData<RoomDto>(roomKey(code), room),
  });
}

export function useRemoveParticipant(code: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (participantId: string) =>
      api.removeParticipant(code, participantId),
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
