/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import _ from 'lodash';
import { Observable } from 'rxjs';
import { ClusterClient } from 'src/core/server';

import { Plugin } from './plugin';
import { EsContext } from './es';
import { IEvent, IEventLogger, IEventLogService } from './types';
import { EventLogger } from './event_logger';
export type PluginClusterClient = Pick<ClusterClient, 'callAsInternalUser' | 'asScoped'>;
export type AdminClusterClient$ = Observable<PluginClusterClient>;

type SystemLogger = Plugin['systemLogger'];

interface EventLogServiceCtorParams {
  enabled: boolean;
  esContext: EsContext;
  esBaseName: string;
  systemLogger: SystemLogger;
}

// note that clusterClient may be null, indicating we can't write to ES
export class EventLogService implements IEventLogService {
  private systemLogger: SystemLogger;
  private enabled: boolean;
  private esContext: EsContext;
  private registeredProviderActions: Map<string, Set<string>>;

  constructor({ enabled, esBaseName, systemLogger, esContext }: EventLogServiceCtorParams) {
    this.enabled = enabled;
    this.esContext = esContext;
    this.systemLogger = systemLogger;
    this.registeredProviderActions = new Map<string, Set<string>>();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  registerProviderActions(provider: string, actions: string[]): void {
    if (this.registeredProviderActions.has(provider)) {
      throw new Error(`provider already registered: "${provider}"`);
    }

    this.registeredProviderActions.set(provider, new Set(actions));
  }

  isProviderActionRegistered(provider: string, action: string): boolean {
    const actions = this.registeredProviderActions.get(provider);
    if (actions == null) return false;

    if (actions.has(action)) return true;

    return false;
  }

  getProviderActions() {
    return new Map(this.registeredProviderActions.entries());
  }

  getLogger(initialProperties: Partial<IEvent>): IEventLogger {
    return new EventLogger({
      esContext: this.esContext,
      eventLogService: this,
      initialProperties,
      systemLogger: this.systemLogger,
    });
  }
}
