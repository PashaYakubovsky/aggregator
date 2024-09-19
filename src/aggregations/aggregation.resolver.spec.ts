import { Test, TestingModule } from '@nestjs/testing';
import { AggregationResolver } from './aggregation.resolver';
import { AggregationsService } from './aggregation.service';
import { NotFoundException } from '@nestjs/common';
import { Aggregation } from './interfaces/aggregation.interface';

jest.mock('./aggregation.service');

describe('AggregationResolver', () => {
  let resolver: AggregationResolver;
  let service: AggregationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AggregationResolver],
      providers: [AggregationsService],
    }).compile();

    resolver = module.get<AggregationResolver>(AggregationResolver);
    service = module.get<AggregationsService>(AggregationsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getAggregation', () => {
    it('should return an aggregation if it exists', async () => {
      const result = {
        from: 'a1',
        id: 'a1',
        name: 'aggregation1',
        type: 'type1',
      };
      jest
        .spyOn(service, 'findOneById')
        .mockImplementationOnce(() => Promise.resolve(result));

      expect(await resolver.getAggregation('a1')).toBe(result);
    });

    it('should throw a NotFoundException if the aggregation does not exist', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockImplementationOnce(() => undefined);

      await expect(resolver.getAggregation('a1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Insert similar tests for getAggregations, addAggregation, removeAggregation and aggregationAdded here
  describe('getAggregations', () => {
    it('should return an array of aggregations', async () => {
      // check result array
      const result = [
        {
          from: 'a1',
          id: 'a1',
          name: 'aggregation1',
          type: 'type1',
        },
        {
          from: 'a2',
          id: 'a2',
          name: 'aggregation2',
          type: 'type2',
        },
      ];

      jest
        .spyOn(service, 'findAll')
        .mockImplementationOnce(() => Promise.resolve(result));

      const expected = await resolver.getAggregations({
        skip: 0,
        take: 10,
      });
      expect(expected).toBe(result);
    });
  });

  describe('addAggregation', () => {
    it('should return an aggregation', async () => {
      const result = {
        from: 'a1',
        id: 'a1',
        name: 'aggregation1',
        type: 'type1',
      };
      jest
        .spyOn(service, 'create')
        .mockImplementationOnce(() => Promise.resolve(result));

      expect(
        await resolver.addAggregation({
          name: 'aggregation1',
          imageUrl: 'https://example.com/image.jpg',
        }),
      ).toBe(result);
    });
  });

  describe('removeAggregation', () => {
    it('should return true', async () => {
      jest
        .spyOn(service, 'remove')
        .mockImplementationOnce(() => Promise.resolve(true));

      expect(await resolver.removeAggregation('a1')).toBe(true);
    });
  });

  describe('aggregationAdded', () => {
    it('should return an aggregation', async () => {
      const result = {
        from: 'a1',
        id: 'a1',
        name: 'aggregation1',
        type: 'type1',
      };

      resolver.pubSub.subscribe(
        'aggregationAdded',
        jest.fn((data: { aggregationAdded: Aggregation }) => {
          debugger;
          expect(data.aggregationAdded).toBe(result);
        }),
      );

      jest
        .spyOn(service, 'create')
        .mockImplementationOnce(() => Promise.resolve(result));
    });
  });
});
