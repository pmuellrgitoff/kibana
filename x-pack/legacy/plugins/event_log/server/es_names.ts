/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

interface Names {
  base: string;
  alias: string;
  indexPattern: string;
  initialIndex: string;
  indexTemplate: string;
}

export function getEsNames(baseName: string): Names {
  return {
    base: baseName,
    alias: baseName,
    indexPattern: `${baseName}-*`,
    initialIndex: `${baseName}-000001`,
    indexTemplate: `${baseName}-template`,
  };
}
