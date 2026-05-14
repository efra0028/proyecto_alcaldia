import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { SistemasModule } from './modules/sistemas/sistemas.module';
import { EstadosRegistroModule } from './modules/estados-registro/estados-registro.module';
import { EstadosPublicacionModule } from './modules/estados-publicacion/estados-publicacion.module';
import { RegistrosModule } from './modules/registros/registros.module';
import { QrCodigosModule } from './modules/qr-codigos/qr-codigos.module';
import { TiposPublicacionModule } from './modules/tipos-publicacion/tipos-publicacion.module';
import { PublicacionesModule } from './modules/publicaciones/publicaciones.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesModule } from './modules/roles/roles.module';
import { EscaneosModule } from './modules/escaneos/escaneos.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadModule } from './modules/upload/upload.module';
import { join } from 'path';

@Module({
  imports: [
    // Variables de entorno globales
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Servir archivos estáticos (imágenes, PDFs, etc.) desde la carpeta "uploads"
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    UploadModule,

    // Base de datos PostgreSQL
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),

    // Rate limiting global
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // max 100 requests por minuto por IP
      },
    ]),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Módulos de la aplicación
    AuthModule,
    UsuariosModule,
    SistemasModule,
    EstadosRegistroModule,
    EstadosPublicacionModule,
    RegistrosModule,
    QrCodigosModule,
    TiposPublicacionModule,
    PublicacionesModule,
    AuditoriaModule,
    RolesModule,
    EscaneosModule,
  ],
  providers: [
    // Rate limiting activo en todos los endpoints
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Interceptor de auditoría global — registra automáticamente todas las mutaciones
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
