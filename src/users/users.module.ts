import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResolver } from './user.resolver';
import { RedisService } from 'src/redis/redis.service';

@Module({
  providers: [UserResolver, UsersService, RedisService],
  exports: [UsersService],
})
export class UsersModule {}
