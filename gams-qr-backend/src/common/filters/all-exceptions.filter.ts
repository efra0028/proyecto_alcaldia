import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Filtro global de excepciones.
 * - Convierte errores de TypeORM/PostgreSQL en respuestas claras sin exponer internos.
 * - Mantiene el formato consistente en todos los errores.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno del servidor';
    let error = 'Internal Server Error';

    // Excepción HTTP de NestJS (404, 400, 401, 403, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message ?? message;
        error = (res as any).error ?? error;
      }
    }
    // Error de query de TypeORM/PostgreSQL
    else if (exception instanceof QueryFailedError) {
      const err = exception as any;
      const pgCode = err.code;

      // Mapear códigos PostgreSQL a mensajes amigables
      if (pgCode === '23505') {
        // unique_violation
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con los mismos datos únicos';
        error = 'Conflict';
      } else if (pgCode === '23503') {
        // foreign_key_violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Referencia a un registro que no existe';
        error = 'Bad Request';
      } else if (pgCode === '23502') {
        // not_null_violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Falta un campo obligatorio';
        error = 'Bad Request';
      } else {
        // Loguear el error real pero no exponerlo
        this.logger.error(`DB Error [${pgCode}]: ${exception.message}`);
        message = 'Error en la base de datos';
        error = 'Database Error';
      }
    }
    // Error genérico de JS/Node
    else if (exception instanceof Error) {
      this.logger.error(`Unhandled: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
