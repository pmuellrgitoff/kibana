/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AlertExecutorOptions, AlertType } from '../types';

export const alertType: AlertType = {
  id: '.fizz-buzz',
  name: 'Alert that fires fizz, buzz, or fizz-buzz based on a counter',
  actionGroups: ['skip', 'fizz', 'buzz', 'fizz-buzz'],
  async executor({ services, params, state }: AlertExecutorOptions) {
    if (state == null) state = {};
    if (state.count == null) state.count = 0;

    const fizz = state.count % 3 === 0;
    const buzz = state.count % 5 === 0;
    const fizzBuzz = fizz && buzz;

    let group: string = 'skip';

    if (fizzBuzz) {
      group = 'fizz-buzz';
    } else if (fizz) {
      group = 'fizz';
    } else if (buzz) {
      group = 'buzz';
    }

    if (group !== 'skip') {
      const context = {
        date: new Date().toISOString(),
        count: state.count,
      };
      services.alertInstanceFactory('').scheduleActions(group, context);
    }

    state.count++;

    return state;
  },
};
