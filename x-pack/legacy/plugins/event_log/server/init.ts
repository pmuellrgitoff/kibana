/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Legacy } from 'kibana';
import { EventLog } from './event_log';
import { LegacySystemLogger } from './legacy_system_logger';

export function init(server: Legacy.Server) {
  const config = server.config();
  const kbnIndexName = config.get('kibana.index');
  const esBaseName = `${kbnIndexName}-event-log`;
  const { callWithInternalUser } = server.plugins.elasticsearch.getCluster('admin');

  const eventLog = new EventLog({
    esBaseName,
    clusterClient: callWithInternalUser,
    systemLogger: new LegacySystemLogger(server),
  });

  server.expose({
    registerEventType: eventLog.registerEventType.bind(eventLog),
    getEventTypes: eventLog.getEventTypes.bind(eventLog),
    registerTags: eventLog.registerTags.bind(eventLog),
    getTags: eventLog.getTags.bind(eventLog),
    searchEvents: eventLog.searchEvents.bind(eventLog),
    getLogger: eventLog.getLogger.bind(eventLog),
  });
}
