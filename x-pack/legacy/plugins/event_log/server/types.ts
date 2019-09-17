/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// the object exposed by the plugin
export interface IEventLog {
  registerEventType(eventType: string, subTypes: string[]): void;
  getEventTypes(): Map<string, Set<string>>;

  registerTags(tags: string[]): void;
  getTags(): Set<string>;

  searchEvents(opts: IEventLogSearchOptions): IEventLogSearchResults;

  getLogger(properties: Partial<IEvent>): IEventLogger;

  getEsBaseName(): string;
}

export interface IEventLogger {
  logEvent(properties: Partial<IEvent>): void;
}

export interface IEvent {
  timestamp: Date;
  spaceId: string;
  username: string;
  pluginId: string;
  type: string;
  subType: string;
  tags: string[];
  data: any;
}

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
