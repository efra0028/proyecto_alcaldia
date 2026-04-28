import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscaneosService } from './escaneos.service';
import { EscaneosController } from './escaneos.controller';
import { Escaneo } from './escaneo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Escaneo])],
  controllers: [EscaneosController],
  providers: [EscaneosService],
  exports: [EscaneosService, TypeOrmModule],
})
export class EscaneosModule {}
