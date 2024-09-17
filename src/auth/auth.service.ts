import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

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
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.username };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
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

  async logout(user: any) {
    console.log(user, 'user');
    return 'logout';
  }

  async signUp(signUpDto: Record<string, any>) {
    console.log(signUpDto, 'signUpDto');
    return 'signup';
  }
}
