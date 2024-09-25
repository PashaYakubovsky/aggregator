import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/auth.decorator';
import { CreateUserDto } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Request() req: Record<string, any>) {
    return this.authService.logout(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(AuthGuard)
  refresh(@Body() refreshDto: Record<string, any>) {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @Public()
  signUp(@Body() signUpDto: CreateUserDto) {
    return this.authService.signUp(signUpDto);
  }
}
