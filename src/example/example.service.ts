import { Injectable } from '@nestjs/common';
import { Example } from './models/example.model';
import { ExampleArgs } from './dto/example.args';
import { NewExampleInput } from './dto/new-example.input';

@Injectable()
export class ExampleService {
  private exampleRepository: Example[] = [];

  async create(data: NewExampleInput): Promise<Example> {
    const example = new Example();
    example.description = data.description;
    example.title = data.title;
    example.id = Math.random().toString(36).substr(2, 9);
    example.creationDate = new Date();

    this.exampleRepository.push(example);

    return example;
  }

  async findOneById(id: string): Promise<Example> {
    return this.exampleRepository.find((example) => example.id === id);
  }

  async findAll(args: ExampleArgs): Promise<Example[]> {
    return this.exampleRepository;
  }

  async remove(id: string): Promise<boolean> {
    if (!this.exampleRepository.find((example) => example.id === id)) {
      return false;
    }
    this.exampleRepository = this.exampleRepository.filter(
      (example) => example.id !== id,
    );
    return true;
  }
}
