import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator para proteger endpoints por rol.
 * Uso: @Roles('SUPER_ADMIN', 'ADMIN')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
