import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  MIN_PARTICIPANTS_TO_COMPUTE,
  type LatLng,
  type PlaceCategory,
  type PlaceDto,
  type RoomDto,
  type TravelDto,
} from '@midly/shared';
import { PrismaService } from '../prisma/prisma.service';
import {
  KAKAO_CATEGORY,
  KakaoClient,
  type KakaoPlace,
} from '../external/kakao.client';
import { OdsayClient } from '../external/odsay.client';
import { centroid, chooseBestIndex } from './midpoint.algorithm';
import { toRoomDto } from '../rooms/room.mapper';

const MAX_CANDIDATES = 5;
const CANDIDATE_RADII = [2000, 5000, 10000, 20000]; // m, 순차 확장
const PLACE_RADIUS = 800; // m
const PLACES_PER_CATEGORY = 3;

interface Candidate {
  name: string;
  lat: number;
  lng: number;
}

interface ParticipantPoint {
  id: string;
  nickname: string;
  lat: number;
  lng: number;
}

@Injectable()
export class MidpointService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kakao: KakaoClient,
    private readonly odsay: OdsayClient,
  ) {}

  async compute(code: string): Promise<RoomDto> {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: {
        participants: { orderBy: { createdAt: 'asc' } },
        result: true,
      },
    });
    if (!room || room.expiresAt.getTime() < Date.now()) {
      throw new NotFoundException('모임을 찾을 수 없거나 만료되었어요.');
    }
    if (room.participants.length < MIN_PARTICIPANTS_TO_COMPUTE) {
      throw new BadRequestException(
        `중간지점 계산은 최소 ${MIN_PARTICIPANTS_TO_COMPUTE}명부터 가능해요.`,
      );
    }

    const points: LatLng[] = room.participants.map((p) => ({
      lat: p.lat,
      lng: p.lng,
    }));
    const center = centroid(points);

    const candidates = await this.findCandidates(center);
    if (candidates.length === 0) {
      throw new UnprocessableEntityException(
        '근처에 만날 만한 거점(역)을 찾지 못했어요. 출발지가 너무 흩어져 있어요.',
      );
    }

    const candidateTravels = await this.computeTravels(
      candidates,
      room.participants,
    );
    const bestIdx = chooseBestIndex(candidateTravels);
    const chosen = candidates[bestIdx];
    const travels = candidateTravels[bestIdx];

    const places = await this.findNearbyPlaces(chosen);

    await this.persistResult(room.id, center, chosen, travels, places);
    return this.reload(code);
  }

  /** centroid 근처 지하철역 후보를 반경을 넓혀가며 찾는다. */
  private async findCandidates(center: LatLng): Promise<Candidate[]> {
    for (const radius of CANDIDATE_RADII) {
      const places = await this.kakao.searchCategory(
        KAKAO_CATEGORY.SUBWAY,
        center.lng,
        center.lat,
        radius,
        MAX_CANDIDATES,
      );
      if (places.length > 0) {
        return places.slice(0, MAX_CANDIDATES).map(this.toCandidate);
      }
    }
    return [];
  }

  /** 후보 × 참여자 대중교통 이동시간 행렬 */
  private async computeTravels(
    candidates: Candidate[],
    participants: ParticipantPoint[],
  ): Promise<TravelDto[][]> {
    const matrix: TravelDto[][] = [];
    for (const c of candidates) {
      const travels = await Promise.all(
        participants.map(async (p) => {
          const t = await this.odsay.transitTime(
            { lat: p.lat, lng: p.lng },
            { lat: c.lat, lng: c.lng },
          );
          return {
            participantId: p.id,
            nickname: p.nickname,
            minutes: t.minutes,
            transfers: t.transfers,
            noRoute: t.noRoute,
          };
        }),
      );
      matrix.push(travels);
    }
    return matrix;
  }

  /** 선택된 거점 근처 카페·음식점 추천 */
  private async findNearbyPlaces(center: Candidate): Promise<PlaceDto[]> {
    const [cafes, restaurants] = await Promise.all([
      this.kakao.searchCategory(
        KAKAO_CATEGORY.CAFE,
        center.lng,
        center.lat,
        PLACE_RADIUS,
        PLACES_PER_CATEGORY,
      ),
      this.kakao.searchCategory(
        KAKAO_CATEGORY.RESTAURANT,
        center.lng,
        center.lat,
        PLACE_RADIUS,
        PLACES_PER_CATEGORY,
      ),
    ]);
    return [
      ...cafes.slice(0, PLACES_PER_CATEGORY).map((p) => this.toPlace(p, '카페')),
      ...restaurants
        .slice(0, PLACES_PER_CATEGORY)
        .map((p) => this.toPlace(p, '음식점')),
    ];
  }

  private toCandidate = (p: KakaoPlace): Candidate => ({
    name: p.place_name,
    lat: Number(p.y),
    lng: Number(p.x),
  });

  private toPlace(p: KakaoPlace, category: PlaceCategory): PlaceDto {
    return {
      name: p.place_name,
      category,
      lat: Number(p.y),
      lng: Number(p.x),
      url: p.place_url,
    };
  }

  private async persistResult(
    roomId: string,
    center: LatLng,
    chosen: Candidate,
    travels: TravelDto[],
    places: PlaceDto[],
  ): Promise<void> {
    const data = {
      centerLat: center.lat,
      centerLng: center.lng,
      chosenName: chosen.name,
      chosenLat: chosen.lat,
      chosenLng: chosen.lng,
      travels: travels as unknown as Prisma.InputJsonValue,
      places: places as unknown as Prisma.InputJsonValue,
    };
    await this.prisma.$transaction([
      this.prisma.result.upsert({
        where: { roomId },
        create: { roomId, ...data },
        update: { ...data, computedAt: new Date() },
      }),
      this.prisma.room.update({
        where: { id: roomId },
        data: { status: 'COMPUTED' },
      }),
    ]);
  }

  private async reload(code: string): Promise<RoomDto> {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: {
        participants: { orderBy: { createdAt: 'asc' } },
        result: true,
      },
    });
    return toRoomDto(room!);
  }
}
