/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// ---------------------------------- WARNING ----------------------------------
// this file was generated, and should not be edited by hand
// ---------------------------------- WARNING ----------------------------------

// provides TypeScript and config-schema interfaces for ECS for use with
// the event log

import { schema } from '@kbn/config-schema';

export const ECS_VERSION_GENERATED = '1.2.0';

// a typescript interface describing the schema
export interface IEventGenerated {
  '@timestamp'?: string | string[];
  tags?: string | string[];
  message?: string | string[];
  ecs?: {
    version?: string | string[];
  };
  event?: {
    action?: string | string[];
    provider?: string | string[];
    start?: string | string[];
    duration?: number | number[];
    end?: string | string[];
  };
  user?: {
    name?: string | string[];
  };
  kibana?: {
    saved_objects?: string | string[];
    server_uuid?: string | string[];
    space_id?: string | string[];
  };
}

// a config-schema  describing the schema
export const EventSchemaGenerated = schema.maybe(
  schema.object({
    '@timestamp': ecsDate(),
    tags: ecsString(),
    message: ecsString(),
    ecs: schema.maybe(
      schema.object({
        version: ecsString(),
      })
    ),
    event: schema.maybe(
      schema.object({
        action: ecsString(),
        provider: ecsString(),
        start: ecsDate(),
        duration: ecsNumber(),
        end: ecsDate(),
      })
    ),
    user: schema.maybe(
      schema.object({
        name: ecsString(),
      })
    ),
    kibana: schema.maybe(
      schema.object({
        saved_objects: ecsString(),
        server_uuid: ecsString(),
        space_id: ecsString(),
      })
    ),
  })
);

function ecsString() {
  return schema.maybe(schema.oneOf([schema.string(), schema.arrayOf(schema.string())]));
}

function ecsNumber() {
  return schema.maybe(schema.oneOf([schema.number(), schema.arrayOf(schema.number())]));
}

function ecsDate() {
  return schema.maybe(schema.string({ validate: validateDate }));
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function validateDate(isoDate: string) {
  if (ISO_DATE_PATTERN.test(isoDate)) return;
  return 'string is not a valid ISO date: ' + isoDate;
}
