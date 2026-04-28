import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SistemasService } from './sistemas.service';
import { SistemasController } from './sistemas.controller';
import { Sistema } from './sistema.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sistema])],
  controllers: [SistemasController],
  providers: [SistemasService],
  exports: [SistemasService, TypeOrmModule], // exportamos para el ApiKeyGuard
})
export class SistemasModule {}
