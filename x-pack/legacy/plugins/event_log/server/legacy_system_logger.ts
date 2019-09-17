/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// Builds a NP-like Logger from a Legacy logger.  Just enough so code using
// it shouldn't have to change when we switch to a NP Logger.

import { Legacy } from 'kibana';

import { PLUGIN_ID } from '../index';

export class LegacySystemLogger {
  private server: Legacy.Server;

  constructor(server: Legacy.Server) {
    this.server = server;
  }

  debug(message: string): void {
    this.server.log([PLUGIN_ID, 'debug'], message);
  }

  info(message: string): void {
    this.server.log([PLUGIN_ID, 'info'], message);
  }

  warn(message: string): void {
    this.server.log([PLUGIN_ID, 'warn'], message);
  }

  error(message: string): void {
    this.server.log([PLUGIN_ID, 'error'], message);
  }
}
