/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Root } from 'joi';
import { Legacy } from 'kibana';
import { mappings } from './mappings';
import { IEventLog } from '../../../plugins/event_log/server/types';

const PLUGIN_ID = 'event_log_saved_objects';
const LOG_LEVEL = 'info';
const LOG_TAGS = [LOG_LEVEL, PLUGIN_ID];

export function actions(kibana: any) {
  return new kibana.Plugin({
    id: PLUGIN_ID,
    configPrefix: PLUGIN_ID,
    require: ['kibana', 'elasticsearch', 'xpack_main'],
    config(Joi: Root) {
      return Joi.object()
        .keys({
          enabled: Joi.boolean().default(false),
        })
        .default();
    },
    init,
    uiExports: {
      mappings,
    },
  });
}

interface ILogger {
  // log(tags: string[], message: string): void;
  log: Legacy.Server['log'];
}

let Logger: ILogger;

function log(message: string) {
  Logger.log(LOG_TAGS, message);
}

async function init(server: Legacy.Server) {
  initLogger(server);
  log('init() starting');

  const savedObjects = server.savedObjects;
  const elasticsearch = server.plugins.elasticsearch;

  const eventLog: IEventLog = (server as any).newPlatform.setup.plugins.event_log;

  log('waiting for event_log to return ready');
  try {
    await eventLog.legacyWaitForES();
  } catch (err) {
    log('event_log returned an error waiting for ready: ${err.message}');
    throw new Error(err.message);
  }

  eventLog.legacySetSavedObjects({ savedObjects, elasticsearch });
  log('sent event_log savedObjects and elasticsearch');
}

function initLogger(server: Legacy.Server) {
  Logger = {
    log(
      tags: string | string[],
      data?: string | object | (() => any) | undefined,
      timestamp?: number | undefined
    ): void {
      return server.log(tags, data);
    },
  };
}
