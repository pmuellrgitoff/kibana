/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { IEvent, IEventLogger } from './types';
import { EventLog } from './event_log';
import { validateEvent } from './event';

interface IEventLoggerCtorParams {
  eventLog: EventLog;
  initialProperties: Partial<IEvent>;
}

export function createNoopEventLogger(): IEventLogger {
  return {
    logEvent(eventProperties: Partial<IEvent>): void {},
  };
}

export class EventLogger implements IEventLogger {
  private eventLog: EventLog;
  private initialProperties: Partial<IEvent>;

  constructor(ctorParams: IEventLoggerCtorParams) {
    this.eventLog = ctorParams.eventLog;
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
      this.eventLog.systemLogger.warn(`attempt to log an invalid event: ${err.message}`);
      return;
    }

    this.eventLog._writeLogEvent(event as IEvent);
  }
}
