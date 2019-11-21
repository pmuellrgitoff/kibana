/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { SavedObjectsClientContract, SavedObjectsSerializer } from 'src/core/server';
import { Logger } from './types';

export interface EventLogSavedObjectsServiceParams {
  logger: Logger;
  config: any;
  callWithInternalUser: any;
  savedObjectsRepository: SavedObjectsClientContract;
  serializer: SavedObjectsSerializer;
}

export class EventLogSavedObjectsService {
  private logger: Logger;

  constructor(params: EventLogSavedObjectsServiceParams) {
    this.logger = params.logger;
    this.logger.debug('service: creating');
  }

  foo(name: string) {
    this.logger.debug(`service: foo(${name}`);
  }
}
