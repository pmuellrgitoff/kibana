/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import {
  CoreSetup,
  CoreStart,
  Logger,
  Plugin as CorePlugin,
  PluginInitializerContext,
  ClusterClient,
} from 'src/core/server';

import { EventLogConfigType, IEventLog, IEventLogger } from './types';
import { EventLog } from './event_log';
import { initializeEventLogES } from './es_init';
import { defineRoutes } from './routes';

// TODO - figure out how to get ${kibana.index} for `.kibana`
const KIBANA_INDEX = '.kibana';
const ES_BASE_NAME = `${KIBANA_INDEX}-event-log`;

export class Plugin implements CorePlugin<IEventLog> {
  private readonly config$: Observable<EventLogConfigType>;
  private systemLogger: Logger;
  private eventLog?: IEventLog;
  private eventLogger?: IEventLogger;
  private clusterClient?: ClusterClient;

  constructor(private readonly context: PluginInitializerContext) {
    this.systemLogger = this.context.logger.get();
    this.config$ = this.context.config.create<EventLogConfigType>();
  }

  async setup(core: CoreSetup): Promise<IEventLog> {
    this.systemLogger.debug('setting up plugin');

    const config = await this.config$.pipe(first()).toPromise();
    if (!config.enabled) {
      this.systemLogger.info('plugin is disabled; event logging is disabled');
      return new EventLog({
        esBaseName: ES_BASE_NAME,
        systemLogger: this.systemLogger,
      });
    }

    this.clusterClient = await core.elasticsearch.adminClient$.pipe(first()).toPromise();

    const router = core.http.createRouter();
    defineRoutes({ clusterClient: this.clusterClient, eventLogIndex: ES_BASE_NAME, router });

    this.eventLog = new EventLog({
      esBaseName: ES_BASE_NAME,
      systemLogger: this.systemLogger,
      clusterClient: this.clusterClient,
    });

    this.eventLog.registerEventType('event_log', ['starting', 'stopping']);
    this.eventLogger = this.eventLog.getLogger({
      pluginId: 'event_log',
      type: 'event_log',
    });

    return this.eventLog;
  }

  async start(core: CoreStart) {
    this.systemLogger.debug('starting plugin');
    if (this.eventLogger == null) {
      this.systemLogger.warn('event logger is disabled');
      return;
    }

    this.eventLogger.logEvent({ subType: 'starting', data: {} });

    setImmediate(() => this._initializeEs());
  }

  stop() {
    this.systemLogger.debug('stopping plugin');
    if (this.eventLogger == null) return;

    this.eventLogger.logEvent({ subType: 'stopping', data: {} });
  }

  async _initializeEs() {
    if (this.clusterClient == null) return;
    if (this.eventLog == null) return;

    try {
      await initializeEventLogES({
        clusterClient: this.clusterClient,
        indexNameRoot: ES_BASE_NAME,
        logger: this.systemLogger,
      });
    } catch (err) {
      this.systemLogger.debug(
        'error initializing event log bits in elasticsearch; no events will be logged'
      );
    }
  }
}
