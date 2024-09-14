import { Directive, Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType({ description: 'meme' })
export class Meme {
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
