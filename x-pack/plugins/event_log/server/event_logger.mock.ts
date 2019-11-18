/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { IEvent, IEventLogger } from './types';

export function createEventLoggerMock(): IEventLogger {
  return {
    logEvent(eventProperties: Partial<IEvent>): void {},
    startTiming(event: Partial<IEvent>): void {},
    stopTiming(event: Partial<IEvent>): void {},
  };
}
