/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ActionType as ConnectorType } from '@kbn/actions-plugin/server/types';
import { TypeOf } from '@kbn/config-schema';
import type { ActionTypeExecutorOptions as ConnectorTypeExecutorOptions } from '@kbn/actions-plugin/server/types';
import type { ActionTypeExecutorResult as ConnectorTypeExecutorResult } from '@kbn/actions-plugin/server/types';
import {
  ExecutorPostMessageParamsSchema,
  PostMessageSubActionParamsSchema,
  SlackApiConfigSchema,
  SlackApiSecretsSchema,
  SlackApiParamsSchema,
} from './schema';

export type SlackApiConfig = TypeOf<typeof SlackApiConfigSchema>;
export type SlackApiSecrets = TypeOf<typeof SlackApiSecretsSchema>;

export type PostMessageParams = TypeOf<typeof ExecutorPostMessageParamsSchema>;
export type PostMessageSubActionParams = TypeOf<typeof PostMessageSubActionParamsSchema>;
export type SlackApiParams = TypeOf<typeof SlackApiParamsSchema>;
export type SlackApiConnectorType = ConnectorType<
  SlackApiConfig,
  SlackApiSecrets,
  SlackApiParams,
  unknown
>;

export type SlackApiExecutorOptions = ConnectorTypeExecutorOptions<
  SlackApiConfig,
  SlackApiSecrets,
  SlackApiParams
>;

export type SlackExecutorOptions = ConnectorTypeExecutorOptions<
  SlackApiConfig,
  SlackApiSecrets,
  SlackApiParams
>;

export type SlackActionParams = TypeOf<typeof SlackApiParamsSchema>;

export interface GetChannelsResponse {
  ok: true;
  error?: string;
  channels?: Array<{
    id: string;
    name: string;
    is_channel: boolean;
    is_archived: boolean;
    is_private: boolean;
  }>;
}

export interface PostMessageResponse {
  ok: boolean;
  channel?: string;
  error?: string;
  message?: {
    text: string;
  };
}

export interface SlackApiService {
  getChannels: () => Promise<ConnectorTypeExecutorResult<unknown>>;
  postMessage: ({
    channels,
    text,
  }: PostMessageSubActionParams) => Promise<ConnectorTypeExecutorResult<unknown>>;
}
