/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { DefineRoutesParams } from './index';

export function addSearchEndpoint(params: DefineRoutesParams) {
  const { router, esContext } = params;

  // TODO: add tags for access restrictions
  router.post(
    { path: '/api/event_log/_search', validate: false },
    async (context, request, response) => {
      // takes same args as the es `search` api, but we override the `index` param
      const searchBody = Object.assign({}, request.body, { index: esContext.esNames.alias });
      await esContext.waitTillReady();
      const searchResponse = await esContext.callEs('search', searchBody);
      return response.ok({ body: searchResponse });
    }
  );
}
