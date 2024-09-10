import { Injectable } from '@nestjs/common';
import { Meme } from './models/memes.model';

import { NewMemeInput } from './dto/new-meme.input';
import { MemeArgs } from './dto/meme.args';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MemesService {
  private memesRepository: Meme[] = [];

  async create(data: NewMemeInput): Promise<Meme> {
    const meme = new Meme();
    meme.name = data.name;
    meme.imageUrl = data.imageUrl;
    meme.id = uuidv4();

    this.memesRepository.push(meme);

    return meme;
  }

  async findOneById(id: string): Promise<Meme> {
    return this.memesRepository.find((Memes) => Memes.id === id);
  }

  async findAll(args: MemeArgs): Promise<Meme[]> {
    return this.memesRepository;
  }

  async remove(id: string): Promise<boolean> {
    if (!this.memesRepository.find((Memes) => Memes.id === id)) {
      return false;
    }
    this.memesRepository = this.memesRepository.filter(
      (Memes) => Memes.id !== id,
    );
    return true;
  }
}
