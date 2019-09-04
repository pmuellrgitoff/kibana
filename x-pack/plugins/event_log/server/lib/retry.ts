/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

interface RetryOptions {
  count: number;
  delayMillis: number;
}

// run a function a number of times, with delay in between, till it doesn't throw an error
export async function retry(options: RetryOptions, fn: () => any) {
  let error: any;

  for (let attempt = 0; attempt < options.count; attempt++) {
    let result: any;
    let success: boolean = true;

    try {
      result = await fn();
    } catch (err) {
      error = err;
      success = false;
    }

    if (success) return result;

    await delay(options.delayMillis);
  }

  throw error;
}

async function delay(millis: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, millis);
  });
}
