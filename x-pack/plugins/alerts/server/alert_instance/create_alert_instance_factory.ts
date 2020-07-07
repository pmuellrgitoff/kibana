/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AlertInstance } from './alert_instance';

export interface AlertInstanceOptions {
  name?: string;
}

export function createAlertInstanceFactory(alertInstances: Record<string, AlertInstance>) {
  return (id: string, options: AlertInstanceOptions = {}): AlertInstance => {
    if (!alertInstances[id]) {
      alertInstances[id] = new AlertInstance(options);
    }

    return alertInstances[id];
  };
}
