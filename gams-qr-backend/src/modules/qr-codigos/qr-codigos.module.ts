import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCodigosService } from './qr-codigos.service';
import { QrCodigosController } from './qr-codigos.controller';
import { QrCodigo } from './qr-codigo.entity';
import { Escaneo } from '../escaneos/escaneo.entity';
import { Registro } from '../registros/registro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QrCodigo, Escaneo, Registro])],
  controllers: [QrCodigosController],
  providers: [QrCodigosService],
  exports: [QrCodigosService, TypeOrmModule],
})
export class QrCodigosModule {}
