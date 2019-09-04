/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EsNames } from './es_names';

export function getIndexTemplate(esNames: EsNames, ilmExists: boolean) {
  const mapDate = { type: 'date' };
  const mapObject = { type: 'object', enabled: false };
  const mapKeyword = { type: 'keyword', ignore_above: 256 };

  const indexTemplateBody: any = {
    index_patterns: [esNames.indexPattern],
    aliases: {
      [esNames.alias]: {},
    },
    settings: {
      number_of_shards: 1,
      number_of_replicas: 1,
      'index.lifecycle.name': esNames.ilmPolicy,
      'index.lifecycle.rollover_alias': esNames.alias,
    },
    mappings: {
      dynamic: 'strict',
      properties: {
        timestamp: mapDate,
        type: mapKeyword,
        subType: mapKeyword,
        pluginId: mapKeyword,
        spaceId: mapKeyword,
        username: mapKeyword,
        tags: mapKeyword,
        data: mapObject,
      },
    },
  };

  if (!ilmExists) {
    delete indexTemplateBody.settings['index.lifecycle.name'];
    delete indexTemplateBody.settings['index.lifecycle.rollover_alias'];
  }

  return indexTemplateBody;
}

export function getIlmPolicy() {
  return {
    policy: {
      phases: {
        hot: {
          actions: {
            rollover: {
              max_size: '5GB',
              max_age: '30d',
              // max_docs: 1, // you know, for testing
            },
          },
        },
      },
    },
  };
}
