import { Controller, Get } from '@nestjs/common';

@Controller('Aggregation')
export class AggregationController {
  @Get()
  findAll(): string {
    return 'This action returns all Aggregations';
  }
}
