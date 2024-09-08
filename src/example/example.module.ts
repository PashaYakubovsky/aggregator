import { Module } from '@nestjs/common';
import { ExampleResolver } from './example.resolver';
import { ExampleService } from './example.service';
import { DateScalar } from 'src/common/scalars/data.scalar';

@Module({
  providers: [ExampleResolver, ExampleService, DateScalar],
})
export class ExampleModule {}
