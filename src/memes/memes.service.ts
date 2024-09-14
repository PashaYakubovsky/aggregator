import { Injectable, Logger } from '@nestjs/common';
import { Meme } from './models/memes.model';
import { Cron, CronExpression } from '@nestjs/schedule';

import { NewMemeInput } from './dto/new-meme.input';
import { MemeArgs } from './dto/meme.args';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MemesService {
  private memesRepository: Meme[] = [];
  private readonly logger = new Logger(MemesService.name);

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

  async findAll({ skip, take }: MemeArgs): Promise<Meme[]> {
    return this.memesRepository.slice(skip, skip + take);
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

  @Cron(CronExpression.EVERY_10_SECONDS)
  async aggregateFromReddit(): Promise<Meme[]> {
    let memes;
    const fetchOpt = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
    };
    try {
      // Fetch memes from Reddit API
      memes = await fetch(
        'https://www.reddit.com/r/memes.json?limit=1000$sort=hot',
        fetchOpt,
      );
      // convert readable stream to json
      const memesJson = await memes.json();
      // extract memes from json
      const memesArray = memesJson.data.children.map((meme) => ({
        name: meme.data.title,
        imageUrl: meme.data.url,
        type: meme.data.post_hint,
        id: meme.data.id,
        createdAt: new Date(),
        from: 'Reddit',
      })) as Meme[];

      // clean duplicates
      const uniqueMemesArray = memesArray.filter(
        (meme, index, self) =>
          index === self.findIndex((m) => m.name === meme.name),
      );

      // add memes to repository
      this.memesRepository.push(...uniqueMemesArray);

      this.logger.log('Memes aggregated from Reddit');

      return memesArray;
    } catch (error) {
      this.logger.error(error.message);
      return [];
    }
  }

  // @Cron(CronExpression.EVERY_10_MINUTES)
  // async aggregateFromImgflip(): Promise<Meme[]> {
  //   let memes;
  //   const fetchOpt = {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'User-Agent':
  //         'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  //     },
  //   };

  //   try {
  //     type ImgflipMeme = {
  //       id: string;
  //       name: string;
  //       url: string;
  //       width: number;
  //       height: number;
  //       box_count: number;
  //       captions: number;
  //     };
  //     // Fetch memes from Imgflip API
  //     memes = await fetch('https://api.imgflip.com/get_memes', fetchOpt);
  //     // convert readable stream to json
  //     const memesJson = (await memes.json()) as {
  //       data: { memes: ImgflipMeme[] };
  //     };
  //     // extract memes from json
  //     const memesArray = memesJson.data.memes.map((meme) => ({
  //       name: meme.name,
  //       imageUrl: meme.url,
  //       id: meme.id,
  //       createdAt: new Date(),
  //       from: 'imgflip',
  //     })) as Meme[];

  //     // clean duplicates
  //     const uniqueMemesArray = memesArray.filter(
  //       (meme, index, self) =>
  //         index === self.findIndex((m) => m.name === meme.name),
  //     );

  //     // add memes to repository
  //     this.memesRepository.push(...uniqueMemesArray);

  //     this.logger.log('Memes aggregated from Imgflip');

  //     return memesArray;
  //   } catch (error) {
  //     this.logger.error(error.message);
  //     return [];
  //   }
  // }

  // // Aggregate memes from memes generator
  // async aggregateFromMemesGenerator(): Promise<Meme[]> {
  //   const options = {
  //     method: 'GET',
  //     url: 'https://ronreiter-meme-generator.p.rapidapi.com/meme',
  //     params: {
  //       font_size: '50',
  //       top: 'Top Text',
  //       font: 'Impact',
  //       bottom: 'Bottom Text',
  //       meme: 'Condescending-Wonka',
  //     },
  //     headers: {
  //       'x-rapidapi-key': '6c132177famshe7bde6a1687a2d4p1c9607jsncfaa4474060b',
  //       'x-rapidapi-host': 'ronreiter-meme-generator.p.rapidapi.com',
  //     },
  //   };

  //   try {
  //     const response = await axios.request(options);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error(error);
  //   }

  //   return [];
  // }

  // Remove memes older than 10 minutes
  @Cron(CronExpression.EVERY_10_MINUTES)
  async removeOldMemes(): Promise<Meme[]> {
    const currentDate = new Date();
    const tenMinutesAgo = new Date(currentDate.getTime() - 10 * 60000);
    this.memesRepository = this.memesRepository.filter(
      (meme) => new Date(meme.createdAt) > tenMinutesAgo,
    );
    this.logger.log('Old memes removed');
    return this.memesRepository;
  }
}
