import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiErrorRes } from '@midly/shared';

const CODE_BY_STATUS: Record<number, string> = {
  400: 'BAD_REQUEST',
  404: 'NOT_FOUND',
  422: 'UNPROCESSABLE',
  429: 'TOO_MANY_REQUESTS',
};

/** 모든 예외를 { code, message } 형태(ApiErrorRes)로 통일해 응답한다. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '문제가 발생했어요. 잠시 후 다시 시도해 주세요.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object' && 'message' in body) {
        const m = (body as { message: unknown }).message;
        message = Array.isArray(m) ? m.join(', ') : String(m);
      }
    } else {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const code =
      CODE_BY_STATUS[status] ?? (status >= 500 ? 'INTERNAL_ERROR' : 'ERROR');
    const payload: ApiErrorRes = { code, message };
    res.status(status).json(payload);
  }
}
