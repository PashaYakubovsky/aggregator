import { Module } from '@nestjs/common';
import { MemesService } from './memes.service';
import { MemesResolver } from './memes.resolver';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  providers: [
    MemesResolver,
    MemesService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class MemesModule {}
