import { Controller, Get } from '@nestjs/common';

@Controller('memes')
export class MemesController {
  @Get()
  findAll(): string {
    return 'This action returns all memes';
  }
}
