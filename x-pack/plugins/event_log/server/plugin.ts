/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import {
  CoreSetup,
  CoreStart,
  Logger,
  Plugin as CorePlugin,
  PluginInitializerContext,
} from 'src/core/server';

import { EventLogConfigType, IEventLog, IEventLogger } from './types';
import { EventLogConfig } from './config';
import { EventLog } from './event_log';
import { initializeEventLogES } from './es_init';

const ES_BASE_NAME = '.kibana-event-log';

export class Plugin implements CorePlugin<IEventLog> {
  private readonly config$: Observable<EventLogConfig>;
  private eventLogger?: IEventLogger;
  private systemLogger: Logger;

  constructor(private readonly context: PluginInitializerContext) {
    this.systemLogger = this.context.logger.get();
    this.config$ = this.context.config
      .create<EventLogConfigType>()
      .pipe(map(config => new EventLogConfig(config, this.context.env)));
  }

  async setup(core: CoreSetup): Promise<IEventLog> {
    this.systemLogger.debug('setting up plugin');

    const config = await this.config$.pipe(first()).toPromise();
    if (!config.isEnabled) {
      this.systemLogger.info('plugin is disabled; event logging is disabled');
      return new EventLog({
        esBaseName: ES_BASE_NAME,
        logger: this.systemLogger,
      });
    }

    const clusterClient = await core.elasticsearch.adminClient$.pipe(first()).toPromise();

    const eventLog = new EventLog({
      esBaseName: ES_BASE_NAME,
      logger: this.systemLogger,
      clusterClient,
    });

    try {
      await initializeEventLogES({
        clusterClient,
        indexNameRoot: ES_BASE_NAME,
        logger: this.systemLogger,
      });
    } catch (err) {
      this.systemLogger.debug(
        'error initializing event log bits in elasticsearch; event logging is disabled'
      );
      eventLog.disable();
    }

    eventLog.registerEventType('event_log', ['starting', 'stopping']);
    this.eventLogger = eventLog.getLogger({
      pluginId: 'event_log',
      type: 'event_log',
    });

    return eventLog;
  }

  async start(core: CoreStart) {
    this.systemLogger.debug('starting plugin');
    if (this.eventLogger == null) {
      this.systemLogger.warn('event logger is disabled');
      return;
    }

    this.eventLogger.logEvent({ subType: 'starting', data: {} });
  }

  stop() {
    this.systemLogger.debug('stopping plugin');
    if (this.eventLogger == null) return;

    this.eventLogger.logEvent({ subType: 'stopping', data: {} });
  }
}
