import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * Este método se llama automáticamente si el token es válido.
   * Lo que retorna se guarda en request.user
   */
  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      nombre: payload.nombre,
      roles: payload.roles, // array de strings: ['SUPER_ADMIN']
    };
  }
}
