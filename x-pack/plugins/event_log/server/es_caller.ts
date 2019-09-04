/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Logger, ClusterClient } from 'src/core/server';

export interface EsContext {
  logger: Logger;
  clusterClient: ClusterClient;
  indexNameRoot: string;
}

// TODO is this defined somewhere, so we can reference it instead of define it?
interface EsError {
  path?: string;
  query?: any;
  statusCode: number;
  response?: any;
  message: string;
}

interface EsCallOptions {
  asNull403?: boolean;
  asNull404?: boolean;
}

// call ES, returning a result
export async function callEs(
  esContext: EsContext,
  operation: string,
  opts: EsCallOptions,
  body?: any
): Promise<any> {
  try {
    debug('called:', body);
    const result = await esContext.clusterClient.callAsInternalUser(operation, body);
    debug('result:', result);
    return result;
  } catch (err) {
    const esErr = err as EsError;

    if (opts.asNull403 && esErr.statusCode === 403) {
      debug('not authorized');
      return null;
    }

    if (opts.asNull404 && esErr.statusCode === 404) {
      debug('not found');
      return null;
    }

    throw new Error(`error calling es:${operation}: ${err.message}`);
  }

  function debug(message: string, object?: any) {
    const objectString = object == null ? '' : JSON.stringify(object);
    esContext.logger.info(`callEs(${operation}) ${message} ${objectString}`);
  }
}
