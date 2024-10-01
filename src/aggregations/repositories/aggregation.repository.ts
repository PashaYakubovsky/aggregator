import { RedisService } from 'src/redis/redis.service';
import { Aggregation } from '../models/aggregation.model';

class aggregationsRepository {
  redisService: RedisService;

  constructor() {
    this.redisService = new RedisService();
  }

  async save(
    aggregation: Aggregation | Aggregation[],
  ): Promise<Aggregation | Aggregation[]> {
    if (Array.isArray(aggregation)) {
      const success = await this.redisService.setMany<Aggregation>(
        'aggregations',
        aggregation,
      );
      if (!success) {
        throw new Error('Failed to save aggregations');
      }
    } else {
      const success = await this.redisService.set<Aggregation>(
        'aggregations',
        aggregation.id,
        aggregation,
      );
      if (!success) {
        throw new Error('Failed to save aggregation');
      }
    }

    return aggregation;
  }

  async find(): Promise<Aggregation[]> {
    return Object.values(
      await this.redisService.hGetAll<Aggregation>('aggregations'),
    );
  }

  async findOne(id: string): Promise<Aggregation | undefined> {
    return this.redisService.getFromCollection<Aggregation>('aggregations', id);
  }
  async delete(id: string): Promise<boolean> {
    return this.redisService.deleteFromCollection('aggregations', id);
  }
}

export default aggregationsRepository;
