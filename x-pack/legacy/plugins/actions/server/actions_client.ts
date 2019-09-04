/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { SavedObjectsClientContract, SavedObjectAttributes, SavedObject } from 'src/core/server';
import { ActionTypeRegistry } from './action_type_registry';
import { validateConfig, validateSecrets } from './lib';
import { ActionResult } from './types';
import { IEventLogger } from '../../../../plugins/event_log/server/types';
import { events, IEventData } from './events';

interface ActionUpdate extends SavedObjectAttributes {
  description: string;
  config: SavedObjectAttributes;
  secrets: SavedObjectAttributes;
}

interface Action extends ActionUpdate {
  actionTypeId: string;
}

interface CreateOptions {
  action: Action;
}

interface FindOptions {
  options?: {
    perPage?: number;
    page?: number;
    search?: string;
    defaultSearchOperator?: 'AND' | 'OR';
    searchFields?: string[];
    sortField?: string;
    hasReference?: {
      type: string;
      id: string;
    };
    fields?: string[];
  };
}

interface FindResult {
  page: number;
  perPage: number;
  total: number;
  data: ActionResult[];
}

interface ConstructorOptions {
  actionTypeRegistry: ActionTypeRegistry;
  savedObjectsClient: SavedObjectsClientContract;
  eventLogger: IEventLogger;
}

interface UpdateOptions {
  id: string;
  action: ActionUpdate;
}

export class ActionsClient {
  private readonly savedObjectsClient: SavedObjectsClientContract;
  private readonly actionTypeRegistry: ActionTypeRegistry;
  public readonly eventLogger: IEventLogger;

  constructor(params: ConstructorOptions) {
    this.actionTypeRegistry = params.actionTypeRegistry;
    this.savedObjectsClient = params.savedObjectsClient;
    this.eventLogger = params.eventLogger;
  }

  /**
   * Create an action
   */
  public async create({ action }: CreateOptions): Promise<ActionResult> {
    const { actionTypeId, description, config, secrets } = action;
    const actionType = this.actionTypeRegistry.get(actionTypeId);
    const validatedActionTypeConfig = validateConfig(actionType, config);
    const validatedActionTypeSecrets = validateSecrets(actionType, secrets);

    const eventData: IEventData = { actionTypeId, config, description };
    let result;
    try {
      result = await this.savedObjectsClient.create('action', {
        actionTypeId,
        description,
        config: validatedActionTypeConfig as SavedObjectAttributes,
        secrets: validatedActionTypeSecrets as SavedObjectAttributes,
      });
    } catch (err) {
      eventData.message = err.message;
      this.eventLogger.logEvent(events.createFailed(eventData));
      throw err;
    }

    eventData.actionId = result.id;
    this.eventLogger.logEvent(events.created(eventData));

    return {
      id: result.id,
      actionTypeId: result.attributes.actionTypeId,
      description: result.attributes.description,
      config: result.attributes.config,
    };
  }

  /**
   * Update action
   */
  public async update({ id, action }: UpdateOptions): Promise<ActionResult> {
    const existingObject = await this.savedObjectsClient.get('action', id);
    const { actionTypeId } = existingObject.attributes;
    const { description, config, secrets } = action;
    const actionType = this.actionTypeRegistry.get(actionTypeId);
    const validatedActionTypeConfig = validateConfig(actionType, config);
    const validatedActionTypeSecrets = validateSecrets(actionType, secrets);
    const eventData: IEventData = { actionId: id, actionTypeId, config, description };

    let result;
    try {
      result = await this.savedObjectsClient.update('action', id, {
        actionTypeId,
        description,
        config: validatedActionTypeConfig as SavedObjectAttributes,
        secrets: validatedActionTypeSecrets as SavedObjectAttributes,
      });
    } catch (err) {
      eventData.message = err.message;
      this.eventLogger.logEvent(events.updateFailed(eventData));
      throw err;
    }

    this.eventLogger.logEvent(events.updated(eventData));
    return {
      id,
      actionTypeId: result.attributes.actionTypeId as string,
      description: result.attributes.description as string,
      config: result.attributes.config as Record<string, any>,
    };
  }

  /**
   * Get an action
   */
  public async get({ id }: { id: string }): Promise<ActionResult> {
    const result = await this.savedObjectsClient.get('action', id);

    return {
      id,
      actionTypeId: result.attributes.actionTypeId as string,
      description: result.attributes.description as string,
      config: result.attributes.config as Record<string, any>,
    };
  }

  /**
   * Find actions
   */
  public async find({ options = {} }: FindOptions): Promise<FindResult> {
    const findResult = await this.savedObjectsClient.find({
      ...options,
      type: 'action',
    });

    return {
      page: findResult.page,
      perPage: findResult.per_page,
      total: findResult.total,
      data: findResult.saved_objects.map(actionFromSavedObject),
    };
  }

  /**
   * Delete action
   */
  public async delete({ id }: { id: string }) {
    // need to get the action to write to the event log
    const action = await this.get({ id });

    const eventData: IEventData = {
      actionId: id,
      actionTypeId: action.actionTypeId,
      config: action.config,
      description: action.description,
    };

    let result;
    try {
      result = await this.savedObjectsClient.delete('action', id);
    } catch (err) {
      this.eventLogger.logEvent(events.deleteFailed(eventData));
      throw err;
    }

    this.eventLogger.logEvent(events.deleted(eventData));
    return result;
  }
}

function actionFromSavedObject(savedObject: SavedObject) {
  return {
    id: savedObject.id,
    ...savedObject.attributes,
  };
}
