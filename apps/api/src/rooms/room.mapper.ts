import type { Participant, Result, Room } from '@prisma/client';
import type {
  ParticipantDto,
  PlaceDto,
  ResultDto,
  RoomDto,
  TravelDto,
} from '@midly/shared';

export function toParticipantDto(p: Participant): ParticipantDto {
  return {
    id: p.id,
    nickname: p.nickname,
    originLabel: p.originLabel,
    lat: p.lat,
    lng: p.lng,
  };
}

export function toResultDto(r: Result): ResultDto {
  return {
    center: { lat: r.centerLat, lng: r.centerLng },
    chosen: { name: r.chosenName, lat: r.chosenLat, lng: r.chosenLng },
    travels: r.travels as unknown as TravelDto[],
    places: r.places as unknown as PlaceDto[],
  };
}

type RoomWithRelations = Room & {
  participants: Participant[];
  result: Result | null;
};

export function toRoomDto(room: RoomWithRelations): RoomDto {
  return {
    code: room.code,
    title: room.title,
    status: room.status,
    participants: room.participants.map(toParticipantDto),
    result: room.result ? toResultDto(room.result) : null,
    createdAt: room.createdAt.toISOString(),
    expiresAt: room.expiresAt.toISOString(),
  };
}
