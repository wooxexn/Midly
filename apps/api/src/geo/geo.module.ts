import { Module } from '@nestjs/common';
import { ExternalModule } from '../external/external.module';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';

@Module({
  imports: [ExternalModule],
  controllers: [GeoController],
  providers: [GeoService],
})
export class GeoModule {}
