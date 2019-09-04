/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import _ from 'lodash';
import { ClusterClient } from 'src/core/server';

import { Plugin } from './plugin';
import { ensureInitialized } from './es_init';
import {
  IEvent,
  IEventLogger,
  IEventLog,
  IEventLogSearchResults,
  IEventLogSearchOptions,
} from './types';
import { EventLogger } from './event_logger';

type SystemLogger = Plugin['systemLogger'];

interface EventLogConstructorParams {
  esBaseName: string;
  systemLogger: SystemLogger;
  clusterClient?: ClusterClient;
}

export class EventLog implements IEventLog {
  systemLogger: SystemLogger;
  private esBaseName: string;
  private clusterClient?: ClusterClient;
  private validEventTypes = new Map<string, Set<string>>();
  private validTags = new Set<string>();

  constructor({ esBaseName, systemLogger, clusterClient }: EventLogConstructorParams) {
    this.esBaseName = esBaseName;
    this.systemLogger = systemLogger;
    this.clusterClient = clusterClient;
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
    return new EventLogger({
      eventLog: this,
      initialProperties,
    });
  }

  async searchEvents(opts: IEventLogSearchOptions): Promise<IEventLogSearchResults> {
    // plugin is disabled
    if (this.clusterClient == null) {
      return {
        page: 0,
        perPage: 20,
        total: 0,
        events: [],
      };
    }

    const initialized = await ensureInitialized();
    if (!initialized) {
      throw new Error('unsuccessful initialization of the event log');
    }

    const result: IEventLogSearchResults = {
      page: 0,
      perPage: 100,
      total: 0,
      events: [],
    };

    return result;
  }

  _writeLogEvent(event: IEvent): void {
    // plugin is disabled
    if (this.clusterClient == null) {
      return;
    }

    const indexName = this.esBaseName;

    const doc = {
      index: indexName,
      body: event,
    };

    // TODO:
    // the setImmediate() on an async function is a little overkill, but,
    // setImmediate() may be tweakable via node params, whereas async
    // tweaking is in the v8 params realm, which is very dicey.
    // Long-term, we should probably create an in-memory queue for this, so
    // we can explictly see the queue lengths.

    // already verified this.clusterClient isn't null above
    setImmediate(() => this._writeLogEventDoc(this.clusterClient!, doc));
  }

  // whew, the thing that actually writes the event log document!
  async _writeLogEventDoc(clusterClient: ClusterClient, doc: any) {
    const initialized = await ensureInitialized();
    if (!initialized) {
      // TODO: write log entry to a file

      this.systemLogger.warn(
        'unable to write entry to file; unsuccessful initialization of the event log'
      );
      return;
    }

    const debug = (message: string) => this.systemLogger.debug(message);
    const warn = (message: string) => this.systemLogger.warn(message);

    debug(`writing to event log: ${JSON.stringify(doc)}`);
    try {
      await clusterClient.callAsInternalUser('index', doc);
    } catch (err) {
      // TODO - on failure, write to a file
      warn(`error writing to event log: ${err.message}; ${JSON.stringify(event)}`);
    }
    debug(`writing to event log complete`);
  }
}
