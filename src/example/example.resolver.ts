import { NewExampleInput } from './dto/new-example.input';
import { ExampleArgs } from './dto/example.args';
import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Example } from './models/example.model';
import { ExampleService } from './example.service';

const pubSub = new PubSub();

@Resolver((of) => Example)
export class ExampleResolver {
  constructor(private readonly exampleService: ExampleService) {}

  @Query((returns) => Example)
  async getExample(@Args('id') id: string): Promise<Example> {
    const recipe = await this.exampleService.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Query((returns) => [Example])
  getExamples(@Args() ExampleArgs: ExampleArgs): Promise<Example[]> {
    return this.exampleService.findAll(ExampleArgs);
  }

  @Mutation((returns) => Example)
  async addExample(
    @Args('newExampleData') newExampleData: NewExampleInput,
  ): Promise<Example> {
    const recipe = await this.exampleService.create(newExampleData);
    return recipe;
  }

  @Mutation((returns) => Boolean)
  async removeExample(@Args('id') id: string) {
    return this.exampleService.remove(id);
  }

  @Subscription((returns) => Example)
  exampleAdded() {
    return pubSub.asyncIterator('exampleAdded');
  }
}
