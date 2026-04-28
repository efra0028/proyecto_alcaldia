/**
 * Tipo del usuario extraído del JWT.
 * Coincide con lo que retorna JwtStrategy.validate().
 */
export interface JwtPayload {
  id: number;
  email: string;
  nombre: string;
  roles: string[];
}
