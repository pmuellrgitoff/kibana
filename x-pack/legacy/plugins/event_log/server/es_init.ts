/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Logger, ClusterClient } from 'src/core/server';
import { EsNames, getEsNames } from './es_names';

interface EsContext {
  logger: Logger;
  clusterClient: ClusterClient;
  indexNameRoot: string;
}

const mapDate = { type: 'date' };
const mapObject = { type: 'object', enabled: false };
const mapKeyword = { type: 'keyword', ignore_above: 256 };

const TRY_ILM = true;

function getIndexTemplateBody(esNames: EsNames) {
  return {
    index_patterns: [esNames.indexPattern],
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
}

function getIlmPolicyBody() {
  return {
    policy: {
      phases: {
        hot: {
          actions: {
            rollover: {
              max_docs: '1',
            },
          },
        },
      },
    },
  };
}

export async function initializeEventLogES(esContext: EsContext) {
  const log = (message: string) => esContext.logger.info(message);

  // create the ilm policy, if required
  if (TRY_ILM) {
    log(`checking to see if an ilm policy already exists`);
    const ilmPolicy = await getIlmPolicy(esContext);
    if (ilmPolicy != null) {
      log(`an ilm policy does exist`);
    } else {
      log(`an ilm policy does not exist, so creating one`);
      await addIlmPolicy(esContext);
    }
  }

  // create the index template, if required
  log(`checking to see if an index template already exists`);
  const template = await getTemplate(esContext);

  if (template != null) {
    log(`an index template does exist`);
  } else {
    log(`an index template does not exist, so creating one`);
    await addTemplate(esContext);
  }

  // create the alias and first index, if required
  log(`checking to see if an alias already exists`);
  const alias = await getAlias(esContext);

  if (alias != null) {
    log(`an alias does exist`);
  } else {
    log(`an alias does not exist, so creating initial index and alias`);
    log(`creating initial index`);
    await createInitialIndex(esContext);
    log(`creating alias to initial index`);
    await putAlias(esContext);
  }
}

async function getIlmPolicy(esContext: EsContext) {
  const esNames = getEsNames(esContext.indexNameRoot);
  esContext.logger.info(`getting ilm policy: ${esNames.ilmPolicy}`);
  try {
    return await callEs(esContext, 'transport.request', {
      method: 'GET',
      path: `_ilm/policy/${esNames.ilmPolicy}`,
    });
  } catch (err) {
    const esErr = err as EsError;
    if (esErr.statusCode === 404) {
      esContext.logger.debug(`ilm policy not found: ${esNames.ilmPolicy}`);
      return null;
    }

    throw err;
  }
}

async function addIlmPolicy(esContext: EsContext) {
  const esNames = getEsNames(esContext.indexNameRoot);
  esContext.logger.info(`putting ilm policy: ${esNames.ilmPolicy}`);
  return await callEs(esContext, 'transport.request', {
    method: 'PUT',
    path: `_ilm/policy/${esNames.ilmPolicy}`,
    body: getIlmPolicyBody(),
  });
}

async function getTemplate(esContext: EsContext) {
  const esNames = getEsNames(esContext.indexNameRoot);
  try {
    return await callEs(esContext, 'indices.getTemplate', {
      name: esNames.indexTemplate,
    });
  } catch (err) {
    const esErr = err as EsError;
    if (esErr.statusCode === 404) {
      esContext.logger.debug(`template not found: ${esNames.indexTemplate}`);
      return null;
    }

    throw err;
  }
}

async function addTemplate(esContext: EsContext) {
  const esNames = getEsNames(esContext.indexNameRoot);
  const templateBody = getIndexTemplateBody(esNames);
  return await callEs(esContext, 'indices.putTemplate', {
    create: true,
    name: esNames.indexTemplate,
    body: templateBody,
  });
}

async function getAlias(esContext: EsContext) {
  const esNames = getEsNames(esContext.indexNameRoot);
  try {
    return await callEs(esContext, 'indices.getAlias', {
      name: esNames.alias,
    });
  } catch (err) {
    const esErr = err as EsError;
    if (esErr.statusCode === 404) {
      esContext.logger.debug(`alias not found: ${esNames.alias}`);
      return null;
    }

    throw err;
  }
}

async function putAlias(esContext: EsContext) {
  const esNames = getEsNames(esContext.indexNameRoot);
  return await callEs(esContext, 'indices.putAlias', {
    name: esNames.alias,
    index: esNames.indexPattern,
  });
}

async function createInitialIndex(esContext: EsContext) {
  const esNames = getEsNames(esContext.indexNameRoot);
  return await callEs(esContext, 'indices.create', {
    index: esNames.initialIndex,
  });
}

interface EsError {
  path?: string;
  query?: any;
  statusCode: number;
  response?: any;
}

async function callEs(esContext: EsContext, operation: string, body?: any) {
  let actualOperation = operation;
  if (actualOperation === 'transport.request') {
    actualOperation = `${body.method} ${body.path}`;
  }

  try {
    esContext.logger.info(`callEs(${actualOperation}) called`, body);
    const result = await esContext.clusterClient.callAsInternalUser(operation, body);
    esContext.logger.info(`callEs(${actualOperation}) result`, body);
    return result;
  } catch (err) {
    const esErr = err as EsError;

    esContext.logger.info(
      `callEs(${actualOperation}) throws; status: ${esErr.statusCode}; ${err.message}`
    );

    throw esErr;
  }
}
