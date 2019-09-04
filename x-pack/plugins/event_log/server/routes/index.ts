/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { IRouter } from '../../../../../src/core/server';
import { EsContext } from '../es';
import { IEventLogService } from '../types';

import { addSearchEndpoint } from './search';
import { addProviderActionsEndpoint } from './provider_actions';

export interface DefineRoutesParams {
  router: IRouter;
  eventLogService: IEventLogService;
  esContext: EsContext;
}

export function addRoutes(params: DefineRoutesParams) {
  addSearchEndpoint(params);
  addProviderActionsEndpoint(params);
}
