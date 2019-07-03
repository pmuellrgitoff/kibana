/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AlertTypeRegistry } from '../alert_type_registry';

import { alertType as alwaysFiringAlertType } from './always_firing';
import { alertType as fizzBuzzAlertType } from './fizz_buzz';
import { alertType as essqlAlertType } from './essql';

export function registerBuiltInActionTypes(alertTypeRegistry: AlertTypeRegistry) {
  alertTypeRegistry.register(alwaysFiringAlertType);
  alertTypeRegistry.register(fizzBuzzAlertType);
  alertTypeRegistry.register(essqlAlertType);
}
