/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { GetService } from '../../types';

export function isUsingDataStreamForAlerts(getService: GetService): boolean {
  const configService = getService('config');

  const serverArgStrings: string[] = configService.getAll().kbnTestServer.serverArgs;
  const serverArgs = new Set(serverArgStrings);
  const result = serverArgs.has('--xpack.alerting.useDataStreamForAlerts=true');

  return result;
}
