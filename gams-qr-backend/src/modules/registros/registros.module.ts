import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrosService } from './registros.service';
import { RegistrosController } from './registros.controller';
import { Registro } from './registro.entity';
import { EstadoRegistro } from '../estados-registro/estado-registro.entity';
import { SistemasModule } from '../sistemas/sistemas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Registro, EstadoRegistro]),
    SistemasModule, // para el ApiKeyGuard
  ],
  controllers: [RegistrosController],
  providers: [RegistrosService],
  exports: [RegistrosService, TypeOrmModule],
})
export class RegistrosModule {}
