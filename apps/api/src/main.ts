import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Render 등 리버스 프록시 뒤에서 X-Forwarded-For로 실제 클라이언트 IP를 인식 → 레이트리밋 정확화
  app.set('trust proxy', 1);
  app.setGlobalPrefix('api');
  // 쿠키/세션 인증을 쓰지 않으므로 오리진을 특정하고 credentials는 비활성화한다.
  // (origin: true + credentials: true 는 임의 사이트의 인증 요청을 허용하는 취약 설정)
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: webOrigin,
    credentials: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`[api] listening on http://localhost:${port}/api`);
}
bootstrap();
