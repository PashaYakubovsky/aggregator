import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { hashPassword } from 'src/common/helpers/hash';

// This should be a real class/interface representing a user entity
export type User = {
  userId: string;
  username: string;
  passwordHash: string;
};

export type CreateUserDto = {
  username: string;
  password: string;
};

@Injectable()
export class UsersService {
  constructor(private jwtService: JwtService) {}
  private readonly users: User[] = [
    {
      userId: '1',
      username: 'admin',
      passwordHash: '',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async create(
    userDto: CreateUserDto,
  ): Promise<{ user: User; access_token: string }> {
    // check duplicate
    const isDuplicate = this.users.some((u) => u.username === userDto.username);
    if (isDuplicate) {
      throw new Error('Duplicate username');
    }

    // create user
    const user: User = {
      username: userDto.username,
      userId: v4(),
      passwordHash: '',
    };
    try {
      const hash = await hashPassword(userDto.password);
      user.passwordHash = hash;
    } catch (err) {
      console.error('Error hashing password:', err);
      throw err;
    }

    this.users.push(user);

    const access_token = await this.jwtService.signAsync(user, {
      expiresIn: '1h',
    });

    // return access token
    return {
      user,
      access_token,
    };
  }
}
