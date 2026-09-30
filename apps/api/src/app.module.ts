import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { GeoModule } from './geo/geo.module';
import { MidpointModule } from './midpoint/midpoint.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 로그인이 없으므로 기본 요청 제한 (IP당 분당 60회)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    RoomsModule,
    GeoModule,
    MidpointModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
