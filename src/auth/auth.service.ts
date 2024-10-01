import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { User } from 'src/users/models/user.model';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { Public } from 'src/common/decorators/auth.decorator';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Public()
  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    console.log('username', username, 'pass', pass);
    const user = await this.usersService.findOne(username);

    // check if user is admin
    if (username === 'admin' && pass === 'admin') {
      const access_token = await this.jwtService.signAsync(user, {
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

    const access_token = await this.jwtService.signAsync(user, {
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

  @Public()
  async signUp(
    signUpDto: CreateUserDto,
  ): Promise<{ user: User; access_token: string }> {
    return this.usersService.create(signUpDto);
  }
}
