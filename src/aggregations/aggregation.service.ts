// import { UsersService } from './../users/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { Aggregation } from './models/aggregation.model';
import { Cron, CronExpression } from '@nestjs/schedule';

import { NewAggregationInput } from './dto/new-aggregation.input';
import { AggregationArgs } from './dto/aggregation.args';

import { v4 as uuidv4 } from 'uuid';
import { Post } from './interfaces/reddit.interface';
import { PubSub } from 'graphql-subscriptions';
import { UsersService } from 'src/users/users.service';
import AggregationsRepository from './repositories/aggregation.repository';

@Injectable()
export class AggregationsService {
  pagination = `limit=100&sort=new`;
  token = '';
  pubSub: PubSub;
  subRedditsToAggregate: Record<string, string[]> = {};
  aggregationsRepository: AggregationsRepository;
  private readonly logger = new Logger(AggregationsService.name);

  constructor(private usersService: UsersService) {
    this.aggregationsRepository = new AggregationsRepository();
  }

  async create(data: NewAggregationInput): Promise<Aggregation> {
    const aggregation = new Aggregation();
    aggregation.name = data.name;
    aggregation.imageUrl = data.imageUrl;
    aggregation.id = uuidv4();

    this.aggregationsRepository.save(aggregation);

    return aggregation;
  }

  async findOneById(id: string): Promise<Aggregation> {
    return await this.aggregationsRepository.findOne(id);
  }

  async findAll({
    skip,
    take,
    filter = [],
  }: AggregationArgs): Promise<Aggregation[]> {
    let data = await this.aggregationsRepository.find();
    if (filter.length > 0) {
      // Create the regular expression from the filter array
      const filteredData = data.filter((d) => {
        if (filter.some((f) => `r/${d.subreddit}`.includes(f))) {
          return d;
        }
      });

      data = filteredData;
    }
    return data.slice(skip, take);
  }

  async remove(id: string): Promise<boolean> {
    const aggregation = await this.aggregationsRepository.findOne(id);
    if (!aggregation) {
      return false;
    }

    await this.aggregationsRepository.delete(id);

    return true;
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_HOUR)
  async aggregateFromReddit(): Promise<Aggregation[]> {
    const users = await this.usersService.findAll();
    let uniqueSubreddits = new Set<string>();

    // get subreddits to aggregate from users
    for (const user of users) {
      this.subRedditsToAggregate[user.username] = user.subscribedTopics;
      user.subscribedTopics.forEach((topic) => uniqueSubreddits.add(topic));
    }

    if (uniqueSubreddits.size > 25) {
      // slice the set to 25 unique subreddits
      uniqueSubreddits = new Set([...uniqueSubreddits].slice(0, 25));
    }

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

    const dataArr: Aggregation[] = [];

    try {
      // aggregate posts from Reddit API
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      for (const subReddit of uniqueSubreddits) {
        aggregations = await fetch(
          `${process.env.REDDIT_API_URL}/${subReddit}.json?limit=100&sort=new`,
          fetchOpt,
        );
        if (aggregations.ok) {
          const aggregationsJson = (await aggregations.json()) as {
            data: {
              children: {
                data: Post;
              }[];
              after: string;
            };
          };

          dataArr.push(
            ...aggregationsJson.data.children.map((d) => {
              const post = d.data as Post;
              const lCamelCaseWithSpaces = post.title.replaceAll(
                /([A-Z])/g,
                ' $1',
              );
              let htmlText = '';
              if (post?.selftext_html) {
                htmlText = post?.selftext_html;
              }
              return {
                name: lCamelCaseWithSpaces,
                imageUrl: post.url,
                type: post.post_hint,
                id: post.id,
                createdAt: new Date(post.created * 1000),
                createdAtTime: post.created,
                from: 'Reddit',
                selftext: post.selftext,
                selftextHtml: htmlText,
                subreddit: post.subreddit,
                permalink: post.permalink,
              } as Aggregation;
            }),
          );
        }
        await wait(1000);
      }

      // Massive update for the aggregations repository
      this.aggregationsRepository.save(dataArr);
      const allData = await this.aggregationsRepository.find();

      this.logger.log(
        `Aggregations aggregated from Reddit: ${allData.length} posts`,
      );

      if (this.pubSub) {
        this.pubSub.publish('aggregationUpdated', {
          aggregationUpdated: this.aggregationsRepository,
        });
      }

      return allData;
    } catch (error) {
      this.logger.error(error.message);
      return [];
    }
  }
}
