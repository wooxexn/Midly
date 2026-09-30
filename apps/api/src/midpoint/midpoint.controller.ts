import { Controller, Param, Post } from '@nestjs/common';
import type { RoomDto } from '@midly/shared';
import { MidpointService } from './midpoint.service';

@Controller('rooms')
export class MidpointController {
  constructor(private readonly midpoint: MidpointService) {}

  @Post(':code/compute')
  compute(@Param('code') code: string): Promise<RoomDto> {
    return this.midpoint.compute(code);
  }
}
