/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

const mapDate = { type: 'date' };
const mapObject = { type: 'object', enabled: false };
const mapKeyword = { type: 'keyword', ignore_above: 256 };

export const mappings: any = {
  event: {
    timestamp: mapDate,
    type: mapKeyword,
    subType: mapKeyword,
    pluginId: mapKeyword,
    spaceId: mapKeyword,
    username: mapKeyword,
    tags: mapKeyword,
    data: mapObject,
  },
};
