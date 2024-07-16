/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Import exception list API endpoint
 *   version: 2023-10-31
 */

import { z } from 'zod';
import { BooleanFromString } from '@kbn/zod-helpers';

import {
  ExceptionListId,
  ExceptionListHumanId,
  ExceptionListItemHumanId,
} from '../model/exception_list_common.gen';

export type ExceptionListsImportBulkError = z.infer<typeof ExceptionListsImportBulkError>;
export const ExceptionListsImportBulkError = z.object({
  error: z.object({
    status_code: z.number().int(),
    message: z.string(),
  }),
  id: ExceptionListId.optional(),
  list_id: ExceptionListHumanId.optional(),
  item_id: ExceptionListItemHumanId.optional(),
});

export type ExceptionListsImportBulkErrorArray = z.infer<typeof ExceptionListsImportBulkErrorArray>;
export const ExceptionListsImportBulkErrorArray = z.array(ExceptionListsImportBulkError);

export type ImportExceptionListRequestQuery = z.infer<typeof ImportExceptionListRequestQuery>;
export const ImportExceptionListRequestQuery = z.object({
  /** 
      * Determines whether existing exception lists with the same `list_id` are overwritten.
If any exception items have the same `item_id`, those are also overwritten.
 
      */
  overwrite: BooleanFromString.optional().default(false),
  overwrite_exceptions: BooleanFromString.optional().default(false),
  overwrite_action_connectors: BooleanFromString.optional().default(false),
  /** 
      * Determines whether the list being imported will have a new `list_id` generated.
Additional `item_id`'s are generated for each exception item. Both the exception
list and its items are overwritten.
 
      */
  as_new_list: BooleanFromString.optional().default(false),
});
export type ImportExceptionListRequestQueryInput = z.input<typeof ImportExceptionListRequestQuery>;

export type ImportExceptionListResponse = z.infer<typeof ImportExceptionListResponse>;
export const ImportExceptionListResponse = z.object({
  errors: ExceptionListsImportBulkErrorArray,
  success: z.boolean(),
  success_count: z.number().int().min(0),
  success_exception_lists: z.boolean(),
  success_count_exception_lists: z.number().int().min(0),
  success_exception_list_items: z.boolean(),
  success_count_exception_list_items: z.number().int().min(0),
});
