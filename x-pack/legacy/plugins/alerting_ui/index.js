/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { resolve } from 'path';

import { i18n } from '@kbn/i18n';

export function alertingUi(kibana) {
  return new kibana.Plugin({
    id: 'alerting_ui',
    configPrefix: 'xpack.alerting_ui',
    require: ['kibana', 'elasticsearch', 'xpack_main', 'interpreter'],
    publicDir: resolve(__dirname, 'public'),
    name: 'alerting_ui',
    uiExports: {
      app: {
        title: 'Alerting Ui',
        description: 'Provides UI for Kibana alerting/actions',
        main: 'plugins/alerting_ui/app',
      },
      styleSheetPaths: resolve(__dirname, 'public/style/app.scss'),
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) { // eslint-disable-line no-unused-vars
      const xpackMainPlugin = server.plugins.xpack_main;
      if (xpackMainPlugin) {
        const featureId = 'alerting_ui';

        xpackMainPlugin.registerFeature({
          id: featureId,
          name: i18n.translate('alertingUi.featureRegistry.featureName', {
            defaultMessage: 'alerting-ui',
          }),
          navLinkId: featureId,
          icon: 'questionInCircle',
          app: [featureId, 'kibana'],
          catalogue: [],
          privileges: {
            all: {
              api: [],
              savedObject: {
                all: [],
                read: [],
              },
              ui: ['show'],
            },
            read: {
              api: [],
              savedObject: {
                all: [],
                read: [],
              },
              ui: ['show'],
            },
          },
        });
      }
    }
  });
}
