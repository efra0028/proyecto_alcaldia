import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { Auditoria } from './auditoria.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auditoria, Usuario])],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
  exports: [AuditoriaService], // exportamos para que el interceptor pueda inyectarlo
})
export class AuditoriaModule {}
