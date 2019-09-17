/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Legacy } from 'kibana';
import { Root } from 'joi';
import { mappings } from './mappings';
import { init } from './server/init';
import { IEventLog } from './server/types';

export { IEventLog as EventLog };
export { IEventLog as EventLogPlugin };

export const PLUGIN_ID = 'event_log';
const CONFIG_PREFIX = `xpack.${PLUGIN_ID}`;

export function eventLog(kibana: any) {
  return new kibana.Plugin({
    id: PLUGIN_ID,
    configPrefix: CONFIG_PREFIX,
    require: ['kibana', 'elasticsearch'],
    isEnabled(config: Legacy.KibanaConfig) {
      return config.get(`${CONFIG_PREFIX}.enabled`) === true;
    },
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
