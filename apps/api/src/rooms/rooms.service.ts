import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, RoomStatus } from '@prisma/client';
import {
  MAX_PARTICIPANTS,
  ROOM_TTL_DAYS,
  type CreateRoomRes,
  type RoomDto,
} from '@midly/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { generateRoomCode } from './room-code.util';
import { toRoomDto } from './room.mapper';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoomDto): Promise<CreateRoomRes> {
    const code = await this.generateUniqueCode();
    const expiresAt = new Date(Date.now() + ROOM_TTL_DAYS * DAY_MS);
    await this.prisma.room.create({
      data: { code, title: dto.title ?? null, expiresAt },
    });
    return { code };
  }

  async findByCode(code: string): Promise<RoomDto> {
    const room = await this.getActiveRoomOrThrow(code);
    return toRoomDto(room);
  }

  async addParticipant(code: string, dto: AddParticipantDto): Promise<RoomDto> {
    const room = await this.getActiveRoomOrThrow(code);
    if (room.participants.length >= MAX_PARTICIPANTS) {
      throw new BadRequestException(
        `참여자는 최대 ${MAX_PARTICIPANTS}명까지 추가할 수 있어요.`,
      );
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.participant.create({
        data: {
          roomId: room.id,
          nickname: dto.nickname,
          originLabel: dto.originLabel,
          lat: dto.lat,
          lng: dto.lng,
        },
      });
      await this.invalidateResult(tx, room.id, room.status);
    });
    return this.findByCode(code);
  }

  async removeParticipant(
    code: string,
    participantId: string,
  ): Promise<RoomDto> {
    const room = await this.getActiveRoomOrThrow(code);
    const belongs = room.participants.some((p) => p.id === participantId);
    if (!belongs) {
      throw new NotFoundException('참여자를 찾을 수 없어요.');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.participant.delete({ where: { id: participantId } });
      await this.invalidateResult(tx, room.id, room.status);
    });
    return this.findByCode(code);
  }

  /** 참여자 구성이 바뀌면 기존 계산 결과를 무효화하고 수집 상태로 되돌린다. */
  private async invalidateResult(
    tx: Prisma.TransactionClient,
    roomId: string,
    status: RoomStatus,
  ): Promise<void> {
    if (status === 'COMPUTED') {
      await tx.result.deleteMany({ where: { roomId } });
      await tx.room.update({
        where: { id: roomId },
        data: { status: 'COLLECTING' },
      });
    }
  }

  private async getActiveRoomOrThrow(code: string) {
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
    return room;
  }

  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const code = generateRoomCode();
      const existing = await this.prisma.room.findUnique({ where: { code } });
      if (!existing) return code;
    }
    throw new InternalServerErrorException('방 코드 생성에 실패했어요.');
  }
}
