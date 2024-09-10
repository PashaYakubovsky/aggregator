import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { Entity } from 'typeorm';

@ObjectType({ description: 'meme' })
@Entity()
export class Meme {
  id: string;

  @Directive('@upper')
  @Field()
  name: string;

  @Field({ nullable: true })
  imageUrl?: string;
}
