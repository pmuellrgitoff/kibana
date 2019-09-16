/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Hapi from 'hapi';
import { Legacy } from 'kibana';
// import { SavedObjectsClientContract } from 'src/core/server';

// Extend PluginProperties to indicate which plugins are guaranteed to exist
// due to being marked as dependencies
type Plugins = Hapi.PluginProperties;

interface Server extends Legacy.Server {
  plugins: Plugins;
}

export function init(server: Server) {
  // const eventLog: IEventLog = (server as any).newPlatform.setup.plugins.event_log;
  // eventLog.registerEventType('action', ['created', 'deleted', 'updated', 'executed']);
  // server.expose(exposedFunctions);
}
