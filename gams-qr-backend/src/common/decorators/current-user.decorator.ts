import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obtener el usuario autenticado desde el request.
 * Uso: @CurrentUser() user: any
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
