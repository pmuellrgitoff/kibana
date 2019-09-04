/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { schema } from '@kbn/config-schema';
import _ from 'lodash';

import { IEvent } from './types';
import { EventLog } from './event_log';

// validate an event, throwing an error if it's invalid
export function validateEvent(eventLog: EventLog, event: Partial<IEvent>) {
  EventSchema.validate(event);

  const validEventTypes = eventLog.getEventTypes();
  const validEventSubTypes = validEventTypes.get(event.type!);
  const validTags = eventLog.getTags();

  const eventLabel = `event ${event.type} ${event.subType}`;

  if (validEventSubTypes == null) {
    throw new Error(`${eventLabel} invalid; event type ${event.type} has not been registered`);
  }

  if (!validEventSubTypes.has(event.subType!)) {
    throw new Error(`${eventLabel} invalid; event subType ${event.type} has not been registered`);
  }

  for (const tag of event.tags || []) {
    if (!validTags.has(tag)) {
      throw new Error(`${eventLabel} invalid; tag ${tag} has not been registered`);
    }
  }
}

function validateDate(date: any) {
  if (_.isDate(date)) return;
  return `field timestamp should be a Date instance, was "${date}"`;
}

const EventSchema = schema.object({
  timestamp: schema.any({ validate: validateDate }),
  type: schema.string(),
  subType: schema.string(),
  pluginId: schema.maybe(schema.string()),
  spaceId: schema.maybe(schema.string()),
  username: schema.maybe(schema.string()),
  tags: schema.maybe(schema.arrayOf(schema.string())),
  data: schema.any(),
});
