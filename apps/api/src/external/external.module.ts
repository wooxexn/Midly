import { Module } from '@nestjs/common';
import { KakaoClient } from './kakao.client';
import { OdsayClient } from './odsay.client';

@Module({
  providers: [KakaoClient, OdsayClient],
  exports: [KakaoClient, OdsayClient],
})
export class ExternalModule {}
