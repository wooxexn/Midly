import {
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { AddParticipantReq } from '@midly/shared';

export class AddParticipantDto implements AddParticipantReq {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  nickname: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  originLabel: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}
