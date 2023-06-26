/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { IRuleDataClient } from '@kbn/rule-registry-plugin/server';

import { GetService } from '../../types';
import { isUsingDataStreamForAlerts } from './use_data_stream_for_alerts';

export const cleanupRegistryIndices = async (getService: GetService, client: IRuleDataClient) => {
  const es = getService('es');
  const useDataStream = isUsingDataStreamForAlerts(getService);
  const dataStreams = await es.indices.getDataStream({
    name: '.alerts-*',
    expand_wildcards: 'all',
    include_defaults: true,
  });
  const dataStreamNames = dataStreams.data_streams.map((dataStream) => dataStream.name);
  if (useDataStream) {
    expect(dataStreamNames.length).to.be.greaterThan(0);
    await es.indices.deleteDataStream({ name: dataStreamNames }, { ignore: [404] });
  } else {
    expect(dataStreamNames.length).to.be(0);
  }

  const aliasMap = await es.indices.get({
    index: `${client.indexName}*`,
    allow_no_indices: true,
    expand_wildcards: 'open',
  });
  const indices = Object.keys(aliasMap);

  if (useDataStream) {
    expect(indices.length).to.be(0);
  } else {
    expect(indices.length).to.be.greaterThan(0);
    await es.indices.delete({ index: indices }, { ignore: [404] });
  }
};
