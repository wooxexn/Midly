import { Controller, Get, Query } from '@nestjs/common';
import type { GeoSearchResult } from '@midly/shared';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Get('search')
  search(@Query('q') q: string): Promise<GeoSearchResult[]> {
    return this.geo.search(q ?? '');
  }
}
