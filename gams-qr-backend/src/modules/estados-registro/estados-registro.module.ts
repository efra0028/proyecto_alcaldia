import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadosRegistroService } from './estados-registro.service';
import { EstadosRegistroController } from './estados-registro.controller';
import { EstadoRegistro } from './estado-registro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoRegistro])],
  controllers: [EstadosRegistroController],
  providers: [EstadosRegistroService],
  exports: [EstadosRegistroService, TypeOrmModule],
})
export class EstadosRegistroModule {}
