import { Injectable, Logger } from '@nestjs/common';
import { Aggregation } from './models/aggregation.model';
import { Cron, CronExpression } from '@nestjs/schedule';

import { NewAggregationInput } from './dto/new-aggregation.input';
import { AggregationArgs } from './dto/aggregation.args';

import { v4 as uuidv4 } from 'uuid';
import { Post } from './interfaces/reddit.interface';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class AggregationsService {
  private aggregationsRepository: Aggregation[] = [];
  pagination = `limit=100&sort=new`;
  token = '';
  pubSub: PubSub;
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

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_30_MINUTES)
  async aggregateFromReddit(): Promise<Aggregation[]> {
    let aggregations;

    const auth = {
      username: process.env.REDDIT_APP_ID,
      password: process.env.REDDIT_APP_SECRET,
    };

    const fetchOpt: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `${process.env.REDDIT_APP_NAME} by ${process.env.REDDIT_USERNAME}`,
        Authorization: `Basic ${Buffer.from(
          `${auth.username}:${auth.password}`,
        ).toString('base64')}`,
      },
    };

    const dataArr: Post[] = [];

    try {
      // aggregate posts from Reddit API
      const url = `${process.env.REDDIT_API_URL}/ProgrammerHumor.json?${this.pagination}`;
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      for (let i = 0; i < 10; i++) {
        aggregations = await fetch(url, fetchOpt);
        if (aggregations.ok) {
          const aggregationsJson = await aggregations.json();
          this.pagination = `after=${aggregationsJson.data.after}&limit=100&sort=new`;
          dataArr.push(...aggregationsJson.data.children.map((d) => d.data));
        }
        await wait(1000);
      }
      // extract data from json
      const aggregationsArray = dataArr.map((d) => {
        const lCamelCaseWithSpaces = d.title.replaceAll(/([A-Z])/g, ' $1');
        return {
          name: lCamelCaseWithSpaces,
          imageUrl: d.url,
          type: d.post_hint,
          id: d.id,
          createdAt: new Date(d.created),
          createdAtTime: d.created,
          from: 'Reddit',
        };
      }) as Aggregation[];

      // clean duplicates
      const uniqueAggregationsArray = [
        ...this.aggregationsRepository,
        ...aggregationsArray,
      ].reduce((acc, current) => {
        const x = acc.find((item) => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, [] as Aggregation[]);

      // add Aggregations to repository
      this.aggregationsRepository = uniqueAggregationsArray;

      this.logger.log(
        `Aggregations aggregated from Reddit: ${this.aggregationsRepository.length} posts`,
      );

      if (this.pubSub) {
        this.pubSub.publish('aggregationUpdated', {
          aggregationUpdated: this.aggregationsRepository,
        });
        this.pubSub.publish('aggregationAdded', {
          aggregationAdded: aggregationsArray,
        });
      }

      return aggregationsArray;
    } catch (error) {
      this.logger.error(error.message);
      return [];
    }
  }

  // reset pagination after 10 hours
  @Cron('0 0 0 * * *')
  async resetPagination(): Promise<void> {
    this.pagination = `limit=100&sort=new`;
    this.logger.log('Pagination reset');
  }
}
