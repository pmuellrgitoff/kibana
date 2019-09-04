/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// import { IEventLogParams } from '../../../../plugins/event_log/server/types';

export interface IEventData {
  actionId?: string;
  actionTypeId: string;
  description: string;
  message?: string;
  config?: any;
  params?: any;
  result?: any;
}

// type eventFn = (data: IEventData) => IEventLogParams;

export const events = {
  created: getEventFn('created'),
  createFailed: getEventFn('createFailed'),
  updated: getEventFn('updated'),
  updateFailed: getEventFn('updateFailed'),
  deleted: getEventFn('deleted'),
  deleteFailed: getEventFn('deleteFailed'),
  executed: getEventFn('executed'),
  executionFailed: getEventFn('executionFailed'),
};

function getEventFn(eventName: string) {
  return (data: IEventData) => ({ subType: eventName, data });
}
