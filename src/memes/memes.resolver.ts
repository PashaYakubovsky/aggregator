import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { MemesService } from './memes.service';
import { Meme } from './models/memes.model';
import { MemeArgs } from './dto/meme.args';
import { NewMemeInput } from './dto/new-meme.input';

const pubSub = new PubSub();

@Resolver((of) => Meme)
export class MemesResolver {
  constructor(private readonly memesService: MemesService) {}

  @Query((returns) => Meme)
  async getMeme(@Args('id') id: string): Promise<Meme> {
    const recipe = await this.memesService.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Query((returns) => [Meme])
  getMemes(@Args() ExampleArgs: MemeArgs): Promise<Meme[]> {
    return this.memesService.findAll(ExampleArgs);
  }

  @Mutation((returns) => Meme)
  async addMeme(
    @Args('newExampleData') newExampleData: NewMemeInput,
  ): Promise<Meme> {
    const recipe = await this.memesService.create(newExampleData);
    return recipe;
  }

  @Mutation((returns) => Boolean)
  async removeMeme(@Args('id') id: string) {
    return this.memesService.remove(id);
  }

  @Subscription((returns) => Meme)
  memeAdded() {
    return pubSub.asyncIterator('memeAdded');
  }
}
