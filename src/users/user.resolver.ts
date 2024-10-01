/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UserArgs } from './dto/user.args';
import { UpdateUserInput } from './dto/upate-user.input';

const pubSub = new PubSub();

@Resolver((of) => User)
export class UserResolver {
  public readonly pubSub: PubSub;
  constructor(private readonly userService: UsersService) {
    this.pubSub = pubSub;
  }

  @Query((returns) => User)
  async getUser(@Args('id') id: string): Promise<User> {
    const recipe = await this.userService.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Query((returns) => [User])
  getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Mutation((returns) => User)
  async addUser(@Args('userInput') userInput: UpdateUserInput): Promise<User> {
    const recipe = await this.userService.updateUser(userInput);
    // 💡 We're publishing the new aggregation her
    pubSub.publish('usersUpdated', { usersUpdated: recipe });
    return recipe;
  }

  @Mutation((returns) => Boolean)
  async removeUser(@Args('id') id: string) {
    return this.userService.remove(id);
  }

  @Subscription((returns) => User)
  usersUpdated() {
    return pubSub.asyncIterator('usersUpdated');
  }
}
