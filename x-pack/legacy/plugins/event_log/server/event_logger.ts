/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import _ from 'lodash';
import { CallCluster } from 'src/legacy/core_plugins/elasticsearch';

import { IEvent, IEventLogger } from './types';
import { EventLog } from './event_log';
import { validateEvent } from './event';
import { LegacySystemLogger } from './legacy_system_logger';

export interface EventLoggerCtorParams {
  eventLog: EventLog;
  clusterClient?: CallCluster;
  initialProperties: Partial<IEvent>;
  systemLogger: LegacySystemLogger;
}

export class EventLogger implements IEventLogger {
  private eventLog: EventLog;
  private systemLogger: LegacySystemLogger;
  private initialProperties: Partial<IEvent>;

  constructor(ctorParams: EventLoggerCtorParams) {
    this.eventLog = ctorParams.eventLog;
    this.systemLogger = ctorParams.systemLogger;
    this.initialProperties = ctorParams.initialProperties;
  }

  // non-blocking, but spawns an async function to do the work
  public logEvent(eventProperties: Partial<IEvent>): void {
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

  async asyncLogEvent(event: IEvent): Promise<void> {
    this.systemLogger.info(`saved_objects logger not yet implemented`);
  }
}
