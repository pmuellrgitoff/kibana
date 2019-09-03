/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import i9r from '../../../../../../src/legacy/core_plugins/interpreter/';
import { interpreterProvider } from '../../../../../../src/plugins/data/common/expressions/interpreter_provider';
import { parse } from '@kbn/interpreter';

describe('create()', () => {
  test('parse an expression', async () => {
    const ast = parse('abc | def');
    expect(i9r).toEqual(null);
    expect(ast).toEqual(null);
  });

  test('interpret an expression', async () => {
    const config = {
      functions: null,
      types: null,
      handlers: null,
    };
    expect(config).toEqual(null);
    expect(interpreterProvider).toEqual(null);
  });
});
