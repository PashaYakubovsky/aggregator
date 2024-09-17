import { Module } from '@nestjs/common';
import { AggregationsService } from './aggregation.service';
import { AggregationResolver } from './aggregation.resolver';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  providers: [
    AggregationResolver,
    AggregationsService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AggregationModule {}
