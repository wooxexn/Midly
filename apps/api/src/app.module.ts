import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { GeoModule } from './geo/geo.module';
import { MidpointModule } from './midpoint/midpoint.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RoomsModule,
    GeoModule,
    MidpointModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
