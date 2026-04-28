import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { Publicacion } from './publicacion.entity';
import { EstadoPublicacion } from '../estados-publicacion/estado-publicacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Publicacion, EstadoPublicacion])],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
  exports: [PublicacionesService],
})
export class PublicacionesModule {}
