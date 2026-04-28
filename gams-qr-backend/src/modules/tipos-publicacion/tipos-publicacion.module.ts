import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposPublicacionService } from './tipos-publicacion.service';
import { TiposPublicacionController } from './tipos-publicacion.controller';
import { TipoPublicacion } from './tipo-publicacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoPublicacion])],
  controllers: [TiposPublicacionController],
  providers: [TiposPublicacionService],
  exports: [TiposPublicacionService, TypeOrmModule],
})
export class TiposPublicacionModule {}
