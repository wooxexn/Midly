import { Controller, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { RoomDto } from '@midly/shared';
import { MidpointService } from './midpoint.service';

@Controller('rooms')
export class MidpointController {
  constructor(private readonly midpoint: MidpointService) {}

  // 외부 API를 다수 호출하는 비싼 연산 → 분당 10회로 제한
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post(':code/compute')
  compute(@Param('code') code: string): Promise<RoomDto> {
    return this.midpoint.compute(code);
  }
}
