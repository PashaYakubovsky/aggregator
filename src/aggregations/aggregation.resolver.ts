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
  public readonly pubSub: PubSub;
  constructor(private readonly aggregationsService: AggregationsService) {
    this.pubSub = pubSub;
  }

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
    // 💡 We're publishing the new aggregation her
    pubSub.publish('aggregationAdded', { aggregationAdded: recipe });
    return recipe;
  }

  @Mutation((returns) => Boolean)
  async removeAggregation(@Args('id') id: string) {
    return this.aggregationsService.remove(id);
  }

  @Subscription((returns) => Aggregation)
  aggregationAdded() {
    return pubSub.asyncIterator('aggregationAdded');
  }
}
