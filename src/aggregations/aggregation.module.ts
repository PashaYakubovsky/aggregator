import { Module } from '@nestjs/common';
import { AggregationsService } from './aggregation.service';
import { AggregationResolver } from './aggregation.resolver';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersModule } from 'src/users/users.module';
import AggregationsRepository from './repositories/aggregation.repository';

@Module({
  imports: [UsersModule],
  providers: [
    AggregationResolver,
    AggregationsService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AggregationsRepository,
  ],
})
export class AggregationModule {}
