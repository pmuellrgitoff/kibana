/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// These tests are intended to see if string values leak from validation
// errors.  They shouldn't, in cases where they are validating passwords
// for instance, and the messages could show up in logs, etc.

import { schema, Type } from '..';

const TestString = 'abc123xyz';

describe('validating a string does not leak', () => {
  describe('when validating against basic type', () => {
    test('number', () => {
      const type = schema.number();
      expect(doesSchemaLeak(type)).toBe(false);
    });

    test('boolean', () => {
      const type = schema.boolean();
      expect(doesSchemaLeak(type)).toBe(false);
    });

    test('object', () => {
      const type = schema.object({});
      expect(doesSchemaLeak(type)).toBe(false);
    });
  });

  describe('when validating against combinator type', () => {
    test('schema.nullable', () => {
      const type = schema.nullable(schema.number());
      expect(doesSchemaLeak(type)).toBe(false);
    });
  });
});

function doesSchemaLeak(type: Type<any>): boolean | string {
  try {
    type.validate(TestString);
  } catch (err) {
    const message = err.message;
    if (message.indexOf(TestString) !== -1) {
      return `leak: ${message}`;
    }
    return false;
  }
  return `expecting schema validation to throw: ${schema}`;
}

// test just this file with:
// node scripts/jest packages/kbn-config-schema/src/types --testNamePattern leak --watch
