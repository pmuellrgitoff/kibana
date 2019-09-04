/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

interface ReadySignal {
  wait(): Promise<boolean>;
  signal(success: boolean): void;
}

export function createReadySignal(): ReadySignal {
  let resolver: (success: boolean) => void;

  const promise = new Promise<boolean>(resolve => {
    resolver = resolve;
  });

  async function wait(): Promise<boolean> {
    try {
      return await promise;
    } catch (err) {
      // should never happen
      return false;
    }
  }

  function signal(success: boolean) {
    resolver(success);
  }

  return { wait, signal };
}
