import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { GeoSearchResult } from '@midly/shared';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  // 자동완성으로 자주 호출 → 분당 40회로 제한
  @Throttle({ default: { ttl: 60_000, limit: 40 } })
  @Get('search')
  search(@Query('q') q: string): Promise<GeoSearchResult[]> {
    return this.geo.search(q ?? '');
  }
}
