/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { AggregationsAggregate, SearchResponse } from '@elastic/elasticsearch/api/types';
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { ElasticsearchClientMock } from 'src/core/server/elasticsearch/client/mocks';
import {
  elasticsearchServiceMock,
  savedObjectsClientMock,
} from '../../../../../../src/core/server/mocks';

import { createUptimeESClient, UptimeESClient } from '../lib';

export interface MultiPageCriteria<K, T> {
  after_key?: K;
  bucketCriteria: T[];
}

/**
 * This utility function will set up a mock ES client, and store subsequent calls. It is designed
 * to let callers easily simulate an arbitrary series of chained composite aggregation calls by supplying
 * custom after_key values.
 *
 * This function is used by supplying criteria, a flat collection of values, and a function that can map
 * those values to the same document shape the tested code expects to receive from elasticsearch.
 * @param criteria A series of objects with the fields of interest.
 * @param genBucketItem A function that maps the criteria to the structure of a document.
 * @template K The Key type of the mock after_key value for simulated composite aggregation queries.
 * @template C The Criteria type that specifies the values of interest in the buckets returned by the mock ES.
 * @template I The Item type that specifies the simulated documents that are generated by the mock.
 */
export const setupMockEsCompositeQuery = <K, C, I>(
  criteria: Array<MultiPageCriteria<K, C>>,
  genBucketItem: (criteria: C) => I
): ElasticsearchClientMock => {
  const esMock = elasticsearchServiceMock.createElasticsearchClient();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  criteria.forEach(({ after_key, bucketCriteria }) => {
    const mockResponse = {
      aggregations: {
        monitors: {
          after_key,
          buckets: bucketCriteria.map((item) => genBucketItem(item)),
        },
      },
    };
    esMock.search.mockResolvedValueOnce({
      body: mockResponse as unknown as SearchResponse,
      statusCode: 200,
      headers: {},
      warnings: [],
      meta: {} as any,
    });
  });

  return esMock;
};

interface UptimeEsMockClient {
  esClient: ElasticsearchClientMock;
  uptimeEsClient: UptimeESClient;
}

export const getUptimeESMockClient = (
  esClientMock?: ElasticsearchClientMock
): UptimeEsMockClient => {
  const esClient = elasticsearchServiceMock.createElasticsearchClient();

  const savedObjectsClient = savedObjectsClientMock.create();

  return {
    esClient: esClientMock || esClient,
    uptimeEsClient: createUptimeESClient({
      esClient: esClientMock || esClient,
      savedObjectsClient,
    }),
  };
};

export function mockSearchResult(
  data: unknown,
  aggregations: Record<string, AggregationsAggregate> = {}
): UptimeESClient {
  const { esClient: mockEsClient, uptimeEsClient } = getUptimeESMockClient();

  mockEsClient.search = jest.fn().mockResolvedValue({
    body: {
      took: 18,
      timed_out: false,
      _shards: {
        total: 1,
        successful: 1,
        skipped: 0,
        failed: 0,
      },
      hits: {
        hits: Array.isArray(data) ? data : [data],
        max_score: 0.0,
        total: {
          value: Array.isArray(data) ? data.length : 0,
          relation: 'gte',
        },
      },
      aggregations,
    },
  });

  return uptimeEsClient;
}
