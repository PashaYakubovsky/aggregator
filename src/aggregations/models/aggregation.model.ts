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
}