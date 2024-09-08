import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType({ description: 'example' })
@Entity()
export class Example {
  @Field((type) => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Directive('@upper')
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;
}
