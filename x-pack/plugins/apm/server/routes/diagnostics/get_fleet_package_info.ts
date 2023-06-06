/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { APMRouteHandlerResources } from '../typings';

export async function getFleetPackageInfo(resources: APMRouteHandlerResources) {
  const fleetPluginStart = await resources.plugins.fleet?.start();
  const packageInfo = await fleetPluginStart?.packageService
    .asScoped(resources.request)
    .getInstallation('apm');

  return {
    isInstalled: packageInfo?.install_status === 'installed',
    version: packageInfo?.version,
  };
}
