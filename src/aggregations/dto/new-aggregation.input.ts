import { Field, InputType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class NewAggregationInput {
  @Field()
  @MaxLength(30)
  name: string;

  @Field({ nullable: true })
  imageUrl?: string;
}
