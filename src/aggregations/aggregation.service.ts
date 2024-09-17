import { Injectable, Logger } from '@nestjs/common';
import { Aggregation } from './models/aggregation.model';
import { Cron, CronExpression } from '@nestjs/schedule';

import { NewAggregationInput } from './dto/new-aggregation.input';
import { AggregationArgs } from './dto/aggregation.args';

import { v4 as uuidv4 } from 'uuid';
import { Post } from './interfaces/reddit.interface';

@Injectable()
export class AggregationsService {
  private aggregationsRepository: Aggregation[] = [];
  private readonly logger = new Logger(AggregationsService.name);

  async create(data: NewAggregationInput): Promise<Aggregation> {
    const aggregation = new Aggregation();
    aggregation.name = data.name;
    aggregation.imageUrl = data.imageUrl;
    aggregation.id = uuidv4();

    this.aggregationsRepository.push(aggregation);

    return aggregation;
  }

  async findOneById(id: string): Promise<Aggregation> {
    return this.aggregationsRepository.find(
      (Aggregations) => Aggregations.id === id,
    );
  }

  async findAll({ skip, take }: AggregationArgs): Promise<Aggregation[]> {
    const data = this.aggregationsRepository.slice(skip, skip + take);
    return data;
  }

  async remove(id: string): Promise<boolean> {
    if (
      !this.aggregationsRepository.find(
        (Aggregations) => Aggregations.id === id,
      )
    ) {
      return false;
    }
    this.aggregationsRepository = this.aggregationsRepository.filter(
      (Aggregations) => Aggregations.id !== id,
    );
    return true;
  }

  pagination = `sort=new`;
  // @Cron(CronExpression.EVERY_10_MINUTES)
  @Cron(CronExpression.EVERY_MINUTE)
  async aggregateFromReddit(): Promise<Aggregation[]> {
    let Aggregations;
    const fetchOpt = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
    };

    const dataArr: Post[] = [];

    try {
      // fetch Aggregations from Reddit API
      // give 15 tries to fetch Aggregations
      const url = `${process.env.REDIT_API_URL}/ProgrammerHumor.json?${this.pagination}`;
      console.log(url, 'reddit url');
      for (let i = 0; i < 15; i++) {
        Aggregations = await fetch(url, fetchOpt);
        if (Aggregations.ok) {
          const AggregationsJson = await Aggregations.json();
          this.pagination = `after=${AggregationsJson.data.after}&sort=new`;
          dataArr.push(...AggregationsJson.data.children.map((d) => d.data));
        }
      }
      // convert readable stream to json
      // extract data from json
      const AggregationsArray = dataArr.map((d) => {
        const lCamelCaseWithSpaces = d.title.replaceAll(/([A-Z])/g, ' $1');
        return {
          name: lCamelCaseWithSpaces,
          imageUrl: d.url,
          type: d.post_hint,
          id: d.id,
          createdAt: new Date(d.created),
          from: 'Reddit',
        };
      }) as Aggregation[];

      // clean duplicates
      const uniqueAggregationsArray = AggregationsArray.filter(
        (Aggregation, index, self) =>
          index === self.findIndex((m) => m.name === Aggregation.name),
      );

      // add Aggregations to repository
      this.aggregationsRepository.push(...uniqueAggregationsArray);

      this.logger.log('Aggregations aggregated from Reddit');

      return AggregationsArray;
    } catch (error) {
      this.logger.error(error.message);
      return [];
    }
  }
}
