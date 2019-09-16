/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Legacy } from 'kibana';
import { Root } from 'joi';
// import mappings from './mappings.json';
import { init } from './server/legacy_init';

export function actions(kibana: any) {
  return new kibana.Plugin({
    id: 'event_log',
    configPrefix: 'xpack.event_log',
    require: ['kibana', 'elasticsearch'],
    isEnabled(config: Legacy.KibanaConfig) {
      return config.get('xpack.event_log.enabled') === true;
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
      // mappings,
    },
  });
}
