/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { IRouter, ClusterClient } from '../../../../src/core/server';

/**
 * Describes parameters used to define HTTP routes.
 */
export interface DefineRoutesParams {
  router: IRouter;
  eventLogIndex: string;
  clusterClient: ClusterClient;
}

export function defineRoutes(params: DefineRoutesParams) {
  const { router, eventLogIndex, clusterClient } = params;

  // TODO: requires more ruggedization, etc
  // currently takes an es 'search' api body, returns it's response
  router.post(
    // TODO: add tags for access restrictions
    { path: '/api/event_log/_search', validate: false },
    async (context, request, response) => {
      const scopedClusterClient = clusterClient.asScoped(request);

      // takes same args as the es `search` api, but we override the `index` param
      const searchBody = Object.assign({}, request.body, { index: eventLogIndex });
      const searchResponse = await scopedClusterClient.callAsCurrentUser('search', searchBody);
      return response.ok({ body: JSON.stringify(searchResponse, null, 4) });
    }
  );
}
