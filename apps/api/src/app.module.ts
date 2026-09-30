import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, RoomsModule],
  controllers: [AppController],
})
export class AppModule {}
