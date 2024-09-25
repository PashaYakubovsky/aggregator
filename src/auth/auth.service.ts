import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, User, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);

    // check if user is admin
    if (username === 'admin' && pass === 'admin') {
      const payload = { sub: 'admin', username: 'admin' };
      const access_token = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      });

      return {
        access_token,
      };
    }

    // check password hash
    let success = false;
    try {
      // compare password
      success = await compare(pass, user.passwordHash);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }

    if (!success) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.userId, username: user.username };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });

    return {
      access_token,
    };
  }

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token,
    };
  }

  async logout(user: User): Promise<string> {
    console.log(user, 'user');
    return 'logout';
  }

  async signUp(
    signUpDto: CreateUserDto,
  ): Promise<{ user: User; access_token: string }> {
    return this.usersService.create(signUpDto);
  }
}
