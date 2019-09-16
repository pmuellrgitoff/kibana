/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ClusterClient, Logger } from 'src/core/server';
import _ from 'lodash';

import { IEvent, IEventLogger } from './types';
import { EventLog } from './event_log';
import { validateEvent } from './event';

interface IEventLoggerCtorParams {
  eventLog: EventLog;
  clusterClient: ClusterClient;
  initialProperties: Partial<IEvent>;
}

export class EventLogger implements IEventLogger {
  private eventLog: EventLog;
  private systemLogger: Logger;
  private clusterClient: ClusterClient;
  private initialProperties: Partial<IEvent>;

  constructor(ctorParams: IEventLoggerCtorParams) {
    this.eventLog = ctorParams.eventLog;
    this.clusterClient = ctorParams.clusterClient;
    this.systemLogger = this.eventLog.getSystemLogger();
    this.initialProperties = ctorParams.initialProperties;
  }

  // non-blocking, but spawns an async task to do the work
  logEvent(eventProperties: Partial<IEvent>): void {
    const event: Partial<IEvent> = {
      ...this.initialProperties,
      ...eventProperties,
      timestamp: new Date(),
    };

    try {
      validateEvent(this.eventLog, event);
    } catch (err) {
      this.systemLogger.warn(`attempt to log an invalid event: ${err.message}`);
      return;
    }

    this.asyncLogEvent(event as IEvent);
  }

  private async asyncLogEvent(event: IEvent): Promise<void> {
    const indexName = this.eventLog.getEsBaseName();

    const doc = {
      index: indexName,
      body: event,
    };

    this.systemLogger.debug(`writing to event log: ${JSON.stringify(doc)}`);
    try {
      await this.clusterClient.callAsInternalUser('index', doc);
    } catch (err) {
      this.systemLogger.warn(
        `error writing to event log: ${err.message}; ${JSON.stringify(event)}`
      );
      // TODO - on failure, event log params should be written to a file for later ingest
    }
  }
}
