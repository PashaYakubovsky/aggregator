import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { hashPassword } from 'src/common/helpers/hash';
import { User } from './models/user.model';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserInput } from './dto/upate-user.input';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UsersService {
  defaultTopics = [
    'r/ProgrammerHumor',
    'r/aww',
    'r/AskReddit',
    'r/todayilearned',
  ];
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    const user = await this.redisService.getFromCollection<User>(
      'users',
      username,
    );

    return user;
  }

  async create(
    userDto: CreateUserDto,
  ): Promise<{ user: User; access_token: string }> {
    // check duplicate
    const users = await this.redisService.hGetAll<User>('users');
    const usersArr = Object.values(users);
    const isDuplicate = usersArr.some((u) => u.username === userDto.username);
    if (isDuplicate) {
      throw new Error('Duplicate username');
    }

    // create user
    const user: User = {
      username: userDto.username,
      id: v4(),
      passwordHash: '',
      subscribedTopics: this.defaultTopics,
    };
    try {
      const hash = await hashPassword(userDto.password);
      user.passwordHash = hash;
    } catch (err) {
      console.error('Error hashing password:', err);
      throw err;
    }

    // save user
    await this.redisService.set<User>('users', user.username, user);

    const access_token = await this.jwtService.signAsync(user, {
      expiresIn: '1h',
    });

    // return access token
    return {
      user,
      access_token,
    };
  }

  async updateUser(input: UpdateUserInput): Promise<User> {
    const user = await this.findOneById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.username = input.name;
    return user;
  }

  async findOneById(userId: string): Promise<User | undefined> {
    const user = await this.redisService.getFromCollection<User>(
      'users',
      userId,
    );

    if (user) {
      const adminUser = await this.findOne('admin');
      // set default subscribed topics
      user.subscribedTopics =
        user.subscribedTopics.length === 0
          ? adminUser.subscribedTopics || []
          : user.subscribedTopics;
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    // return this.users;
    const users = await this.redisService.hGetAll<User>('users');
    return Object.values(users);
  }

  async remove(userId: string): Promise<boolean> {
    const del = await this.redisService.deleteFromCollection('users', userId);
    return del;
  }
}
