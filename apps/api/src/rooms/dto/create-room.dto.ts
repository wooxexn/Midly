import { IsOptional, IsString, MaxLength } from 'class-validator';
import type { CreateRoomReq } from '@midly/shared';

export class CreateRoomDto implements CreateRoomReq {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  title?: string;
}
