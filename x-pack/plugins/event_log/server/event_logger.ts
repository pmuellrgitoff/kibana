/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { schema } from '@kbn/config-schema';
import { merge } from 'lodash';
import { IEvent, IEventLogger, IEventLogService, ECS_VERSION, EventSchema } from './types';
import { Plugin } from './plugin';
import { EsContext } from './es';

type SystemLogger = Plugin['systemLogger'];

interface IEventLoggerCtorParams {
  esContext: EsContext;
  eventLogService: IEventLogService;
  initialProperties: Partial<IEvent>;
  systemLogger: SystemLogger;
}

export function createNoopEventLogger(): IEventLogger {
  return {
    logEvent(eventProperties: Partial<IEvent>): void {},
  };
}

export class EventLogger implements IEventLogger {
  private esContext: EsContext;
  private eventLogService: IEventLogService;
  private initialProperties: Partial<IEvent>;
  private systemLogger: SystemLogger;

  constructor(ctorParams: IEventLoggerCtorParams) {
    this.esContext = ctorParams.esContext;
    this.eventLogService = ctorParams.eventLogService;
    this.initialProperties = ctorParams.initialProperties;
    this.systemLogger = ctorParams.systemLogger;
  }

  // non-blocking, but spawns an async task to do the work
  logEvent(eventProperties: Partial<IEvent>): void {
    const event: Partial<IEvent> = {};

    // merge the initial properties and event properties
    merge(event, this.initialProperties, eventProperties);

    // add fixed properties
    event['@timestamp'] = new Date().toISOString();
    if (event.ecs == null) event.ecs = {};
    event.ecs.version = ECS_VERSION;

    let validatedEvent: Partial<IEvent>;
    try {
      validatedEvent = validateEvent(this.eventLogService, event);
    } catch (err) {
      this.systemLogger.warn(`invalid event logged: ${err.message}`);
      return;
    }

    const doc = {
      index: this.esContext.esNames.alias,
      body: validatedEvent,
    };

    writeLogEvent(this.esContext, doc);
  }
}

const RequiredEventSchema = schema.object({
  provider: schema.string({ minLength: 1 }),
  action: schema.string({ minLength: 1 }),
});

function validateEvent(eventLogService: IEventLogService, event: Partial<IEvent>): Partial<IEvent> {
  if (event.event == null) {
    throw new Error(`no "event" property`);
  }

  // ensure there are provider/action properties in event as strings
  const { provider, action } = event.event;

  // will throw an error if structure doesn't validate
  RequiredEventSchema.validate({ provider, action });

  const validatedProvider = provider as string;
  const validatedAction = action as string;

  if (!eventLogService.isProviderActionRegistered(validatedProvider, validatedAction)) {
    throw new Error(`unregistered provider/action: "${validatedProvider}" / "${validatedAction}"`);
  }

  // could throw an error
  EventSchema.validate(event);

  return event;
}

function writeLogEvent(esContext: EsContext, doc: any): void {
  // TODO:
  // the setImmediate() on an async function is a little overkill, but,
  // setImmediate() may be tweakable via node params, whereas async
  // tweaking is in the v8 params realm, which is very dicey.
  // Long-term, we should probably create an in-memory queue for this, so
  // we can explictly see/set the queue lengths.

  // already verified this.clusterClient isn't null above
  setImmediate(async () => {
    try {
      await writeLogEventDoc(esContext, doc);
    } catch (err) {
      esContext.logger.warn(`error writing event doc: ${err.message}`);
      writeLogEventDocOnError(esContext, doc);
    }
  });
}

// whew, the thing that actually writes the event log document!
async function writeLogEventDoc(esContext: EsContext, doc: any) {
  esContext.logger.info(`writing to event log: ${JSON.stringify(doc)}`);
  await esContext.waitTillReady();
  await esContext.callEs('index', doc);
  esContext.logger.info(`writing to event log complete`);
}

// TODO: write log entry to a file
function writeLogEventDocOnError(esContext: EsContext, doc: any) {
  esContext.logger.warn(`unable to write event doc: ${JSON.stringify(doc)}`);
}
