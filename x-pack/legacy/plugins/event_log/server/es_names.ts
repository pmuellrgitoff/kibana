/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

export interface EsNames {
  base: string;
  alias: string;
  ilmPolicy: string;
  indexPattern: string;
  initialIndex: string;
  indexTemplate: string;
}

export function getEsNames(baseName: string): EsNames {
  return {
    base: baseName,
    alias: baseName,
    ilmPolicy: `${baseName}-policy`,
    indexPattern: `${baseName}-*`,
    initialIndex: `${baseName}-000001`,
    indexTemplate: `${baseName}-template`,
  };
}
