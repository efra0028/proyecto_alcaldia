import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadosPublicacionService } from './estados-publicacion.service';
import { EstadosPublicacionController } from './estados-publicacion.controller';
import { EstadoPublicacion } from './estado-publicacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoPublicacion])],
  controllers: [EstadosPublicacionController],
  providers: [EstadosPublicacionService],
  exports: [EstadosPublicacionService, TypeOrmModule],
})
export class EstadosPublicacionModule {}
