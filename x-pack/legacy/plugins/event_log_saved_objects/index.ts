/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Root } from 'joi';
import { Legacy } from 'kibana';
import { Plugin, PluginSetupContract } from './plugin';
import { SavedObjectsSerializer, SavedObjectsSchema } from '../../../../src/core/server';
import mappings from './mappings.json';
import { migrations } from './migrations';

export { PluginSetupContract as EventLogSavedObjects };

export function eventLogSavedObjects(kibana: any) {
  return new kibana.Plugin({
    id: 'event_log_saved_objects',
    require: ['kibana', 'elasticsearch', 'xpack_main'],
    configPrefix: 'xpack.event_log_saved_objects',
    config(Joi: Root) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },
    init(server: Legacy.Server) {
      const plugin = new Plugin({
        logger: {
          get: () => ({
            info: (message: string) => server.log(['info', 'event_log_saved_objects'], message),
            debug: (message: string) => server.log(['debug', 'event_log_saved_objects'], message),
            warn: (message: string) => server.log(['warn', 'event_log_saved_objects'], message),
            error: (message: string) => server.log(['error', 'event_log_saved_objects'], message),
          }),
        },
      });
      const schema = new SavedObjectsSchema(this.kbnServer.uiExports.savedObjectSchemas);
      const serializer = new SavedObjectsSerializer(schema);
      const setupContract = plugin.setup(
        {},
        {
          serializer,
          config: server.config(),
          elasticsearch: server.plugins.elasticsearch,
          savedObjects: server.savedObjects,
        }
      );
      this.kbnServer.afterPluginsInit(() => {
        (async () => {
          // The code block below can't await directly within "afterPluginsInit"
          // callback due to circular dependency. The server isn't "ready" until
          // this code block finishes. Migrations wait for server to be ready before
          // executing. Saved objects repository waits for migrations to finish before
          // finishing the request. To avoid this, we'll await within a separate
          // function block.
          plugin.start();
        })();
      });
      server.expose(setupContract);
    },
    uiExports: {
      mappings,
      migrations,
      savedObjectSchemas: {
        logEntry: {
          hidden: true,
          isNamespaceAgnostic: false,
          indexPattern: '.kibana-so-event-log',
        },
      },
    },
  });
}
