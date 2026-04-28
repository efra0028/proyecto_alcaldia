import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditoriaService } from '../../modules/auditoria/auditoria.service';
import { AccionAuditoria } from '../../modules/auditoria/auditoria.entity';

// Rutas que NO se auditan (solo lectura o de sistema)
const RUTAS_EXCLUIDAS = [
  '/auth/me',
  '/auditoria',
  '/qr-codigos/scan',
  '/public',
];

// Mapeo de método HTTP → acción de auditoría
const METODO_A_ACCION: Record<string, AccionAuditoria> = {
  POST:   AccionAuditoria.INSERT,
  PUT:    AccionAuditoria.UPDATE,
  PATCH:  AccionAuditoria.UPDATE,
  DELETE: AccionAuditoria.DELETE,
};

/**
 * Interceptor global de auditoría.
 * Registra automáticamente todas las operaciones de mutación (POST, PUT, PATCH, DELETE).
 * GET no se audita.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, body } = request;

    // Solo auditar mutaciones
    const accion = METODO_A_ACCION[method];
    if (!accion) return next.handle();

    // Excluir rutas de sistema
    const esExcluida = RUTAS_EXCLUIDAS.some((ruta) => url.includes(ruta));
    if (esExcluida) return next.handle();

    return next.handle().pipe(
      tap(async (respuesta) => {
        try {
          // Extraer tabla del path: /api/v1/usuarios/1 → 'usuarios'
          const segmentos = url.replace('/api/v1/', '').split('/');
          const tabla_nombre = segmentos[0] ?? 'desconocido';

          // Extraer registro_id de la respuesta o de los params de la URL
          const registro_id = this.extraerRegistroId(respuesta, segmentos);

          await this.auditoriaService.registrar({
            tabla_nombre,
            registro_id,
            accion,
            usuario_id: user?.id ?? null,
            datos_antes: method === 'DELETE' ? respuesta : null,
            datos_despues: method !== 'DELETE' ? respuesta : null,
            ip_address: ip ?? 'unknown',
          });
        } catch (_) {
          // Si la auditoría falla, NO interrumpir la operación principal
        }
      }),
    );
  }

  private extraerRegistroId(respuesta: any, segmentos: string[]): string {
    // Intentar extraer el ID de la respuesta
    if (respuesta?.id) return String(respuesta.id);

    // Si no, usar el segmento de la URL que parece un ID (último segmento numérico o UUID)
    const idSegmento = segmentos.find((s) =>
      /^\d+$/.test(s) || // número
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s), // UUID
    );

    return idSegmento ?? 'N/A';
  }
}
