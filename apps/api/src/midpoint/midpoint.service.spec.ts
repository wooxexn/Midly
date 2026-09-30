import { BadRequestException, NotFoundException } from '@nestjs/common';
import { KAKAO_CATEGORY, type KakaoClient } from '../external/kakao.client';
import type { OdsayClient } from '../external/odsay.client';
import { MidpointService } from './midpoint.service';

function station(name: string, lat: number, lng: number) {
  return {
    id: name,
    place_name: name,
    category_group_code: 'SW8',
    category_name: '',
    x: String(lng),
    y: String(lat),
    place_url: `http://place/${name}`,
    address_name: '',
    road_address_name: '',
  };
}

function makeRoom(participantCount: number) {
  return {
    id: 'room-1',
    code: 'abc123',
    title: null,
    status: 'COLLECTING',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    result: null,
    participants: Array.from({ length: participantCount }, (_, i) => ({
      id: `p${i}`,
      nickname: `p${i}`,
      originLabel: 'x',
      lat: 37.5 + i * 0.01,
      lng: 127.0 + i * 0.01,
      createdAt: new Date(),
    })),
  };
}

describe('MidpointService.compute', () => {
  let prisma: any;
  let kakao: { searchCategory: jest.Mock };
  let odsay: { transitTime: jest.Mock };
  let service: MidpointService;

  beforeEach(() => {
    prisma = {
      room: { findUnique: jest.fn(), update: jest.fn() },
      result: { upsert: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    kakao = { searchCategory: jest.fn() };
    odsay = { transitTime: jest.fn() };
    service = new MidpointService(
      prisma,
      kakao as unknown as KakaoClient,
      odsay as unknown as OdsayClient,
    );
  });

  it('참여자가 최소 인원 미만이면 BadRequestException', async () => {
    prisma.room.findUnique.mockResolvedValue(makeRoom(1));
    await expect(service.compute('abc123')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('방이 없으면 NotFoundException', async () => {
    prisma.room.findUnique.mockResolvedValue(null);
    await expect(service.compute('abc123')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('가장 공평한 거점을 골라 결과를 저장하고 COMPUTED로 만든다', async () => {
    const room = makeRoom(2);
    // 첫 findUnique(계산용) → room, 두 번째(reload) → 결과 포함 room
    prisma.room.findUnique
      .mockResolvedValueOnce(room)
      .mockResolvedValueOnce({
        ...room,
        status: 'COMPUTED',
        result: {
          centerLat: 37.5,
          centerLng: 127.0,
          chosenName: '공평역',
          chosenLat: 37.5,
          chosenLng: 127.0,
          travels: [],
          places: [],
        },
      });

    kakao.searchCategory.mockImplementation((code: string) => {
      if (code === KAKAO_CATEGORY.SUBWAY) {
        return Promise.resolve([
          station('치우침역', 37.5, 127.0),
          station('공평역', 37.51, 127.01),
        ]);
      }
      // 카페/음식점
      return Promise.resolve([station('카페1', 37.5, 127.0)]);
    });

    // 치우침역: 한 명 아주 오래 → max 큼 / 공평역: 둘 다 비슷 → max 작음
    odsay.transitTime.mockImplementation((_from: any, to: any) => {
      if (to.lat === 37.5) {
        // 치우침역
        return Promise.resolve({ minutes: 60, transfers: 1, noRoute: false });
      }
      // 공평역
      return Promise.resolve({ minutes: 25, transfers: 0, noRoute: false });
    });

    const dto = await service.compute('abc123');

    // 결과 저장 확인
    expect(prisma.result.upsert).toHaveBeenCalledTimes(1);
    const upsertArg = prisma.result.upsert.mock.calls[0][0];
    expect(upsertArg.create.chosenName).toBe('공평역'); // minimax 선택
    // 방 상태 COMPUTED
    expect(prisma.room.update).toHaveBeenCalledWith({
      where: { id: 'room-1' },
      data: { status: 'COMPUTED' },
    });
    expect(dto.status).toBe('COMPUTED');
  });
});
