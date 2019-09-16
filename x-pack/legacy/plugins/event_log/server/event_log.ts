/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import _ from 'lodash';
import { ClusterClient } from 'src/core/server';

import { Plugin } from './plugin';
import {
  IEvent,
  IEventLogger,
  IEventLog,
  IEventLogSearchResults,
  IEventLogSearchOptions,
} from './types';
import { EventLogger } from './event_logger';

type Logger = Plugin['systemLogger'];

interface EventLogConstructorParams {
  esBaseName: string;
  logger: Logger;
  clusterClient?: ClusterClient;
}

export class EventLog implements IEventLog {
  private validEventTypes = new Map<string, Set<string>>();
  private validTags = new Set<string>();
  private esBaseName: string;
  private logger: Logger;
  private clusterClient?: ClusterClient;

  constructor({ esBaseName, logger, clusterClient }: EventLogConstructorParams) {
    this.esBaseName = esBaseName;
    this.logger = logger;
    this.clusterClient = clusterClient;
  }

  isEnabled() {
    return this.clusterClient != null;
  }

  disable() {
    this.clusterClient = undefined;
  }

  registerEventType(eventType: string, subTypes: string[]): void {
    if (this.validEventTypes.has(eventType)) {
      throw new Error(`eventType already registered: "${eventType}"`);
    }
    this.validEventTypes.set(eventType, new Set(subTypes));
  }

  getEventTypes(): Map<string, Set<string>> {
    const result = new Map<string, Set<string>>();
    for (const [key, val] of this.validEventTypes) {
      result.set(key, new Set(val));
    }
    return result;
  }

  registerTags(tags: string[]): void {
    for (const tag of tags) {
      this.validTags.add(tag);
    }
  }

  getTags(): Set<string> {
    return new Set<string>(this.validTags);
  }

  getLogger(initialProperties: Partial<IEvent>): IEventLogger {
    if (!this.isEnabled()) {
      return {
        logEvent(eventProperties: Partial<IEvent>): void {},
      };
    }

    return new EventLogger({
      eventLog: this,
      clusterClient: this.clusterClient!,
      initialProperties,
    });
  }

  getSystemLogger(): Logger {
    return this.logger;
  }

  getEsBaseName(): string {
    return this.esBaseName;
  }

  getClusterClient(): ClusterClient | undefined {
    return this.clusterClient;
  }

  searchEvents(opts: IEventLogSearchOptions): IEventLogSearchResults {
    return {
      page: 0,
      perPage: 100,
      total: 0,
      events: [],
    };
  }
}
