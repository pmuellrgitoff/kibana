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

import { EventLogConfigType, IEventLogService, IEventLogger } from './types';
import { EventLogService } from './event_log_service';
import { createEsContext, EsContext } from './es';
import { addRoutes } from './routes';

export type PluginClusterClient = Pick<ClusterClient, 'callAsInternalUser' | 'asScoped'>;

// TODO - figure out how to get ${kibana.index} for `.kibana`
const KIBANA_INDEX = '.kibana';
const ES_BASE_NAME = `${KIBANA_INDEX}-event-log`;

const PROVIDER = 'event_log';
const ACTIONS = {
  starting: 'starting',
  stopping: 'stopping',
};

export class Plugin implements CorePlugin<IEventLogService> {
  private readonly config$: Observable<EventLogConfigType>;
  private systemLogger: Logger;
  private esContext?: EsContext;
  private eventLogger?: IEventLogger;
  private enabled?: boolean;

  constructor(private readonly context: PluginInitializerContext) {
    this.systemLogger = this.context.logger.get();
    this.config$ = this.context.config.create<EventLogConfigType>();
  }

  async setup(core: CoreSetup): Promise<IEventLogService> {
    this.systemLogger.debug('setting up plugin');

    const config = await this.config$.pipe(first()).toPromise();
    this.enabled = config.enabled;

    this.esContext = createEsContext({
      logger: this.systemLogger,
      // TODO: get index prefix from config.get(kibana.index)
      indexNameRoot: '.kibana',
      clusterClient$: core.elasticsearch.adminClient$,
    });

    const eventLogService = new EventLogService({
      enabled: this.enabled,
      esContext: this.esContext,
      esBaseName: ES_BASE_NAME,
      systemLogger: this.systemLogger,
    });

    addRoutes({
      router: core.http.createRouter(),
      esContext: this.esContext,
      eventLogService,
    });

    eventLogService.registerProviderActions(PROVIDER, Object.values(ACTIONS));

    this.eventLogger = eventLogService.getLogger({
      event: { provider: PROVIDER },
    });

    return eventLogService;
  }

  async start(core: CoreStart) {
    this.systemLogger.debug('starting plugin');

    // launches initialization async
    this.esContext!.initialize();

    // will log the event after initialization
    this.eventLogger!.logEvent({
      event: { action: ACTIONS.starting },
    });
  }

  stop() {
    this.systemLogger.debug('stopping plugin');

    // note that it's unlikely this event would ever be written,
    // when Kibana is actuaelly stopping, as it's written asynchronously
    this.eventLogger!.logEvent({
      event: { action: ACTIONS.stopping },
    });
  }
}
