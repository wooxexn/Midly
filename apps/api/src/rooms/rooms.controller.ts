import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import type { CreateRoomRes, RoomDto } from '@midly/shared';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddParticipantDto } from './dto/add-participant.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto): Promise<CreateRoomRes> {
    return this.rooms.create(dto);
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<RoomDto> {
    return this.rooms.findByCode(code);
  }

  @Post(':code/participants')
  addParticipant(
    @Param('code') code: string,
    @Body() dto: AddParticipantDto,
  ): Promise<RoomDto> {
    return this.rooms.addParticipant(code, dto);
  }

  @Delete(':code/participants/:participantId')
  removeParticipant(
    @Param('code') code: string,
    @Param('participantId') participantId: string,
  ): Promise<RoomDto> {
    return this.rooms.removeParticipant(code, participantId);
  }
}
