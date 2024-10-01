import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { createClient, RedisClientType, RedisDefaultModules } from 'redis';

@Injectable()
export class RedisService {
  private readonly client: RedisClientType<RedisDefaultModules>;
  constructor() {
    // initialize redis connection
    config();

    const client = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    });

    client.on('connect', () => {
      console.log('Redis connected');
    });

    client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    client.connect();

    this.client = client as RedisClientType<RedisDefaultModules>;
  }

  async set<T>(collection: string, key: string, value: T): Promise<boolean> {
    const valueString = JSON.stringify(value); // Convert the UserObject to a JSON string
    const result = await this.client.hSet(collection, key, valueString); // Use Redis hash (hset) to store
    return result > 0; // Redis hset returns the number of fields that were added or updated
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async getFromCollection<T>(
    collection: string,
    key: string,
  ): Promise<T | null> {
    const value = await this.client.hGet(collection, key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
    return null;
  }

  async hGetAll<T>(key: string): Promise<Record<string, T>> {
    try {
      const allK = await this.client.hGetAll(key);

      for (const k in allK) {
        try {
          allK[k] = JSON.parse(allK[k]);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
      return allK as Record<string, T>;
    } catch (error) {
      console.error('Error getting value from redis db:', error);
    }
    return {};
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.client.del(key);
    if (result > 0) {
      return true;
    }
    return false;
  }

  async deleteFromCollection(
    collection: string,
    key: string,
  ): Promise<boolean> {
    const result = await this.client.hDel(collection, key);
    if (result > 0) {
      return true;
    }
    return false;
  }

  async setMany<T>(collection: string, values: T[]): Promise<boolean> {
    const multi = this.client.multi();
    values.forEach((value) => {
      const valueString = JSON.stringify(value);
      multi.hSet(collection, value['id'], valueString);
    });

    const result = await multi.exec();
    return result.length === values.length;
  }
}
