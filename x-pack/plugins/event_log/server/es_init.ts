/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EsNames, getEsNames } from './es_names';
import { getIlmPolicy, getIndexTemplate } from './es_documents';
import { callEs, EsContext } from './es_caller';
import { createReadySignal } from './lib/ready_signal';

const initializedReadySignal = createReadySignal();

let initializationCalled = false;

export async function ensureInitialized(): Promise<boolean> {
  return await initializedReadySignal.wait();
}

export async function initializeEventLogES(esContext: EsContext) {
  if (initializationCalled) {
    esContext.logger.info('extraneous elasticsearch initialization ignored');
    return;
  }

  initializationCalled = true;

  try {
    await _initializeEventLogES(esContext);
  } catch (err) {
    esContext.logger.error(`elasticsearch initialization error: ${err.message}`);
    initializedReadySignal.signal(false);
    return;
  }

  initializedReadySignal.signal(true);
}

async function _initializeEventLogES(esContext: EsContext) {
  const debug = (message: string) => esContext.logger.info(message);
  const warn = (message: string) => esContext.logger.warn(message);
  const steps = new EsInitializationSteps(esContext);
  let ilmExists = false;

  // create the ilm policy, if required
  debug(`checking to see if an ilm policy already exists`);
  const ilmGetResult = await steps.getIlmPolicy();

  if (ilmGetResult != null) {
    debug(`an ilm policy does exist`);
    ilmExists = true;
  } else {
    debug(`an ilm policy does not exist, so creating one`);
    const ilmCreateResult = await steps.addIlmPolicy();
    if (ilmCreateResult != null) {
      ilmExists = true;
    } else {
      warn(`unable to create ilm policy`);
      warn(`an ilm policy will need to be created manually`);
    }
  }

  // create the index template, if required
  debug(`checking to see if an index template already exists`);
  const getTemplateResult = await steps.getTemplate();

  if (getTemplateResult) {
    debug(`an index template does exist`);
  } else {
    debug(`an index template does not exist, so creating one`);
    await steps.addTemplate({ ilmExists });
  }

  // create the first index, if required, by checking if alias exists
  debug(`checking to see if an alias already exists`);
  const getAliasResult = await steps.getAlias();

  if (getAliasResult) {
    debug(`an alias does exist`);
  } else {
    debug(`an alias does not exist, so creating initial index`);
    await steps.createInitialIndex();
  }
}

const AS_NULL_404 = { asNull404: true };
const AS_NULL_403_404 = { asNull403: true, asNull404: true };

interface AddTemplateOpts {
  ilmExists: boolean;
}

class EsInitializationSteps {
  private esContext: EsContext;
  private esNames: EsNames;

  constructor(esContext: EsContext) {
    this.esContext = esContext;
    this.esNames = getEsNames(esContext.indexNameRoot);
  }

  async getIlmPolicy(): Promise<any> {
    return await callEs(this.esContext, 'transport.request', AS_NULL_403_404, {
      method: 'GET',
      path: `_ilm/policy/${this.esNames.ilmPolicy}`,
    });
  }

  async addIlmPolicy(): Promise<any> {
    return await callEs(this.esContext, 'transport.request', AS_NULL_403_404, {
      method: 'PUT',
      path: `_ilm/policy/${this.esNames.ilmPolicy}`,
      body: getIlmPolicy(),
    });
  }

  async getTemplate(): Promise<any> {
    return await callEs(this.esContext, 'indices.existsTemplate', AS_NULL_404, {
      name: this.esNames.indexTemplate,
    });
  }

  async addTemplate(opts: AddTemplateOpts): Promise<any> {
    const templateBody = getIndexTemplate(this.esNames, opts.ilmExists);
    return await callEs(
      this.esContext,
      'indices.putTemplate',
      {},
      {
        create: true,
        name: this.esNames.indexTemplate,
        body: templateBody,
      }
    );
  }

  async getAlias(): Promise<any> {
    return await callEs(this.esContext, 'indices.existsAlias', AS_NULL_404, {
      name: this.esNames.alias,
    });
  }

  async createInitialIndex(): Promise<any> {
    return await callEs(
      this.esContext,
      'indices.create',
      {},
      {
        index: this.esNames.initialIndex,
      }
    );
  }
}
