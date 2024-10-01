import { Directive, Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Aggregated item' })
export class Aggregation {
  @Field((type) => ID)
  id: string;

  @Directive('@upper')
  @Field()
  name: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  from: string;

  @Field({ nullable: true })
  type: string;

  @Field({ nullable: true })
  selftextHtml: string;

  @Field({ nullable: true })
  selftext: string;

  @Field({ nullable: true })
  createdAtTime: number;

  @Field({ nullable: true })
  subreddit: string;

  @Field({ nullable: true })
  permalink: string;
}
