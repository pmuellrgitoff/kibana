/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { PluginInitializerContext } from 'src/core/server';
import { EventLogConfigType } from './types';

export class EventLogConfig {
  public readonly isEnabled: boolean;

  constructor(rawConfig: EventLogConfigType, env: PluginInitializerContext['env']) {
    this.isEnabled = rawConfig.isEnabled;
  }
}
