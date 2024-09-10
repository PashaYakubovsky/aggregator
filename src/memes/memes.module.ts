import { Module } from '@nestjs/common';
import { MemesService } from './memes.service';
import { MemesResolver } from './memes.resolver';

@Module({
  providers: [MemesResolver, MemesService],
})
export class MemesModule {}
