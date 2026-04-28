import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SistemasService } from '../../modules/sistemas/sistemas.service';

/**
 * Guard para sistemas externos que se autentican con x-api-key.
 * Uso: @UseGuards(ApiKeyGuard)
 * Header requerido: x-api-key: gams_xxxxx
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly sistemasService: SistemasService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('Se requiere x-api-key en el header');
    }

    const sistema = await this.sistemasService.findByApiKey(apiKey);
    if (!sistema) {
      throw new UnauthorizedException('api_key inválida o sistema inactivo');
    }

    // Inyectar el sistema en el request para usarlo en el controlador
    request.sistema = sistema;
    return true;
  }
}
