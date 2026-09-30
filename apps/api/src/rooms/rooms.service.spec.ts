import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MAX_PARTICIPANTS } from '@midly/shared';
import { RoomsService } from './rooms.service';

type MockTx = {
  participant: { create: jest.Mock; delete: jest.Mock };
  result: { deleteMany: jest.Mock };
  room: { update: jest.Mock };
};

function makeRoom(overrides: Partial<any> = {}) {
  return {
    id: 'room-1',
    code: 'abc123',
    title: null,
    status: 'COLLECTING',
    participants: [],
    result: null,
    createdAt: new Date('2026-09-01T00:00:00Z'),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ...overrides,
  };
}

describe('RoomsService', () => {
  let prisma: any;
  let tx: MockTx;
  let service: RoomsService;

  beforeEach(() => {
    tx = {
      participant: { create: jest.fn(), delete: jest.fn() },
      result: { deleteMany: jest.fn() },
      room: { update: jest.fn() },
    };
    prisma = {
      room: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      participant: { create: jest.fn(), delete: jest.fn() },
      result: { deleteMany: jest.fn() },
      $transaction: jest.fn(async (cb: (t: MockTx) => Promise<unknown>) =>
        cb(tx),
      ),
    };
    service = new RoomsService(prisma);
  });

  describe('create', () => {
    it('6자리 코드를 발급하고 만료일을 약 30일 뒤로 설정한다', async () => {
      prisma.room.findUnique.mockResolvedValue(null); // 충돌 없음

      const res = await service.create({});

      expect(res.code).toHaveLength(8);
      expect(prisma.room.create).toHaveBeenCalledTimes(1);
      const { data } = prisma.room.create.mock.calls[0][0];
      expect(data.code).toBe(res.code);
      const daysAhead =
        (data.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      expect(daysAhead).toBeGreaterThan(29);
      expect(daysAhead).toBeLessThanOrEqual(30);
    });

    it('코드가 충돌하면 다시 생성한다', async () => {
      prisma.room.findUnique
        .mockResolvedValueOnce({ id: 'dup' }) // 첫 코드 충돌
        .mockResolvedValueOnce(null); // 두 번째 코드 사용 가능

      await service.create({});

      expect(prisma.room.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.room.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByCode', () => {
    it('방이 없으면 NotFoundException', async () => {
      prisma.room.findUnique.mockResolvedValue(null);
      await expect(service.findByCode('nope12')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('만료된 방이면 NotFoundException', async () => {
      prisma.room.findUnique.mockResolvedValue(
        makeRoom({ expiresAt: new Date(Date.now() - 1000) }),
      );
      await expect(service.findByCode('abc123')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('유효한 방이면 RoomDto를 반환한다', async () => {
      prisma.room.findUnique.mockResolvedValue(makeRoom());
      const dto = await service.findByCode('abc123');
      expect(dto.code).toBe('abc123');
      expect(dto.status).toBe('COLLECTING');
      expect(dto.participants).toEqual([]);
      expect(dto.result).toBeNull();
    });
  });

  describe('addParticipant', () => {
    const participant = {
      nickname: '우선',
      originLabel: '강남역',
      lat: 37.4979,
      lng: 127.0276,
    };

    it('참여자를 추가한다', async () => {
      prisma.room.findUnique.mockResolvedValue(makeRoom());
      await service.addParticipant('abc123', participant);
      expect(tx.participant.create).toHaveBeenCalledTimes(1);
    });

    it('이미 계산된(COMPUTED) 방에 추가하면 결과를 무효화하고 수집 상태로 되돌린다', async () => {
      prisma.room.findUnique.mockResolvedValue(
        makeRoom({ status: 'COMPUTED' }),
      );

      await service.addParticipant('abc123', participant);

      expect(tx.result.deleteMany).toHaveBeenCalledWith({
        where: { roomId: 'room-1' },
      });
      expect(tx.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { status: 'COLLECTING' },
      });
    });

    it('수집 중(COLLECTING) 방이면 결과 무효화를 건너뛴다', async () => {
      prisma.room.findUnique.mockResolvedValue(makeRoom());
      await service.addParticipant('abc123', participant);
      expect(tx.result.deleteMany).not.toHaveBeenCalled();
      expect(tx.room.update).not.toHaveBeenCalled();
    });

    it('최대 인원을 초과하면 BadRequestException', async () => {
      const full = Array.from({ length: MAX_PARTICIPANTS }, (_, i) => ({
        id: `p${i}`,
      }));
      prisma.room.findUnique.mockResolvedValue(
        makeRoom({ participants: full }),
      );
      await expect(
        service.addParticipant('abc123', participant),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('removeParticipant', () => {
    it('방에 없는 참여자면 NotFoundException', async () => {
      prisma.room.findUnique.mockResolvedValue(makeRoom());
      await expect(
        service.removeParticipant('abc123', 'ghost'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('참여자를 삭제한다', async () => {
      prisma.room.findUnique.mockResolvedValue(
        makeRoom({ participants: [{ id: 'p1' }] }),
      );
      await service.removeParticipant('abc123', 'p1');
      expect(tx.participant.delete).toHaveBeenCalledWith({
        where: { id: 'p1' },
      });
    });
  });
});
