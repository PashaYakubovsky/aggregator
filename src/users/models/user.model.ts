import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType({ description: 'User' })
export class User {
  @Field((type) => ID)
  id: string;
  @Field()
  username: string;
  @Field({ nullable: true })
  passwordHash: string;
  @Field(() => [String]) // Explicitly define the type
  subscribedTopics: string[];
}
