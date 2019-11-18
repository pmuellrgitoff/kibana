/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { TypeOf } from '@kbn/config-schema';
import { configSchema } from './config_schema';

import { IEventGenerated, EventSchemaGenerated, ECS_VERSION_GENERATED } from '../generated/schemas';

export type IEvent = IEventGenerated;
export const ECS_VERSION = ECS_VERSION_GENERATED;
export const EventSchema = EventSchemaGenerated;
export type EventLogConfigType = TypeOf<typeof configSchema>;

// the object exposed by plugin.setup()
export interface IEventLogService {
  isEnabled(): boolean;
  registerProviderActions(provider: string, actions: string[]): void;
  isProviderActionRegistered(provider: string, action: string): boolean;
  getProviderActions(): Map<string, Set<string>>;

  getLogger(properties: Partial<IEvent>): IEventLogger;
}

export interface IEventLogger {
  logEvent(properties: Partial<IEvent>): void;
  startTiming(event: Partial<IEvent>): void;
  stopTiming(event: Partial<IEvent>): void;
}

/*
export interface IEventLogSearchOptions {
  startDate?: Date;
  endDate?: Date;
  pluginId?: string;
  spaceId?: string;
  username?: string;
  type?: string;
  subType?: string;
  tags: string[];
}

export interface IEventLogSearchResults {
  page: number;
  perPage: number;
  total: number;
  events: IEvent[];
}
*/
