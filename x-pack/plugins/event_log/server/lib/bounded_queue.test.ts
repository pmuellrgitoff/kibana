/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { createBoundedQueue, IBoundedQueue } from './bounded_queue';
import { loggingServiceMock } from '../../../../../src/core/server/logging/logging_service.mock';

const logger = loggingServiceMock.create();

describe('basic', () => {
  test('basic bits', () => {
    const discardedHelper = new DiscardedHelper();
    const onDiscarded = discardedHelper.onDiscarded.bind(discardedHelper);

    const maxLength = 10;
    const queue = createBoundedQueue<number>({ logger, maxLength, onDiscarded });

    discardedHelper.reset();
    expect(queue.isEmpty()).toEqual(true);
    expect(queue.isFull()).toEqual(false);
    expect(queue.isCloseToFull()).toEqual(false);
    expect(queue.length).toEqual(0);
    expect(queue.maxLength).toEqual(10);
    expect(queue.pull(1)).toEqual([]);
    expect(queue.pull(100)).toEqual([]);
    expect(discardedHelper.discarded).toEqual([]);

    discardedHelper.reset();
    queue.push(1);
    expect(queue.isEmpty()).toEqual(false);
    expect(queue.isFull()).toEqual(false);
    expect(queue.isCloseToFull()).toEqual(false);
    expect(queue.length).toEqual(1);
    expect(queue.maxLength).toEqual(10);
    expect(queue.pull(1)).toEqual([1]);
    expect(queue.pull(1)).toEqual([]);
    expect(discardedHelper.discarded).toEqual([]);

    discardedHelper.reset();
    queue.push(1);
    queue.push(2);
    expect(queue.isEmpty()).toEqual(false);
    expect(queue.isFull()).toEqual(false);
    expect(queue.isCloseToFull()).toEqual(false);
    expect(queue.length).toEqual(2);
    expect(queue.maxLength).toEqual(10);
    expect(queue.pull(1)).toEqual([1]);
    expect(queue.pull(1)).toEqual([2]);
    expect(queue.pull(1)).toEqual([]);
    expect(discardedHelper.discarded).toEqual([]);
  });
});

class DiscardedHelper<T> {
  private _discarded: T[];

  constructor() {
    this.reset();
    this.onDiscarded = this.onDiscarded.bind(this);
  }

  onDiscarded(object: T) {
    this._discarded.push(object);
  }

  public get discarded(): T[] {
    return this._discarded;
  }

  reset() {
    this._discarded = [];
  }
}
