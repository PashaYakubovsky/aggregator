import { Module } from '@nestjs/common';
import { ExampleResolver } from './example.resolver';
import { ExampleService } from './example.service';

@Module({
  providers: [ExampleResolver, ExampleService],
})
export class ExampleModule {}
