import { Module } from '@nestjs/common';
import { ExternalModule } from '../external/external.module';
import { MidpointController } from './midpoint.controller';
import { MidpointService } from './midpoint.service';

@Module({
  imports: [ExternalModule],
  controllers: [MidpointController],
  providers: [MidpointService],
})
export class MidpointModule {}
