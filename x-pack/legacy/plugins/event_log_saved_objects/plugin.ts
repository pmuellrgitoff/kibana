/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Logger } from './types';
import { EventLogSavedObjectsService } from './event_log_saved_objects_service';

export interface PluginSetupContract {
  foo: EventLogSavedObjectsService['foo'];
}

export interface LegacyDeps {
  config: any;
  serializer: any;
  elasticsearch: any;
  savedObjects: any;
}

interface PluginInitializerContext {
  logger: {
    get: () => Logger;
  };
}

export class Plugin {
  private logger: Logger;
  private service?: EventLogSavedObjectsService;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  // TODO: Make asynchronous like new platform
  public setup(
    core: {},
    { config, serializer, elasticsearch, savedObjects }: LegacyDeps
  ): PluginSetupContract {
    const { callWithInternalUser } = elasticsearch.getCluster('admin');
    const savedObjectsRepository = savedObjects.getSavedObjectsRepository(callWithInternalUser, [
      'logEntry',
    ]);

    const service = new EventLogSavedObjectsService({
      config,
      savedObjectsRepository,
      serializer,
      callWithInternalUser,
      logger: this.logger,
    });
    this.service = service;

    return {
      foo: (name: string) => service.foo(name),
    };
  }

  public start() {
    if (this.service) {
      this.logger.info('starting');
    }
  }

  public stop() {
    if (this.service) {
      this.logger.info('stopping');
    }
  }
}
