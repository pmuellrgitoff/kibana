/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { DefineRoutesParams } from './index';

export function addProviderActionsEndpoint(params: DefineRoutesParams) {
  const { router, eventLogService } = params;

  // TODO: add tags for access restrictions
  router.get(
    { path: '/api/event_log/provider_actions', validate: false },
    async (context, request, response) => {
      const providerActionsMap = eventLogService.getProviderActions();
      const result: Record<string, string[]> = {};
      for (const provider of providerActionsMap.keys()) {
        result[provider] = Array.from(providerActionsMap.get(provider)!);
      }
      return response.ok({ body: result });
    }
  );
}
