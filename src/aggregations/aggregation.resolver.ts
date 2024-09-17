import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AggregationsService } from './aggregation.service';
import { Aggregation } from './models/aggregation.model';
import { AggregationArgs } from './dto/aggregation.args';
import { NewAggregationInput } from './dto/new-aggregation.input';

const pubSub = new PubSub();

@Resolver((of) => Aggregation)
export class AggregationResolver {
  constructor(private readonly aggregationsService: AggregationsService) {}

  @Query((returns) => Aggregation)
  async getAggregation(@Args('id') id: string): Promise<Aggregation> {
    const recipe = await this.aggregationsService.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Query((returns) => [Aggregation])
  getAggregations(
    @Args() ExampleArgs: AggregationArgs,
  ): Promise<Aggregation[]> {
    return this.aggregationsService.findAll(ExampleArgs);
  }

  @Mutation((returns) => Aggregation)
  async addAggregation(
    @Args('newExampleData') newExampleData: NewAggregationInput,
  ): Promise<Aggregation> {
    const recipe = await this.aggregationsService.create(newExampleData);
    return recipe;
  }

  @Mutation((returns) => Boolean)
  async removeMeme(@Args('id') id: string) {
    return this.aggregationsService.remove(id);
  }

  @Subscription((returns) => Aggregation)
  aggregationAdded() {
    return pubSub.asyncIterator('aggregationAdded');
  }
}
