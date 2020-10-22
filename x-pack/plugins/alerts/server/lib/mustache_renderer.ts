/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Mustache from 'mustache';

type Escape = 'markdown' | 'slack' | 'json' | 'none';

export function renderMustache(
  string: string,
  variables: Record<string, unknown>,
  escape: Escape = 'none'
): string {
  const previousMustacheEscape = Mustache.escape;
  Mustache.escape = getEscape(escape);

  try {
    return Mustache.render(string, variables);
  } catch (err) {
    // log error
    return `error rendering mustache template "${string}"`;
  } finally {
    Mustache.escape = previousMustacheEscape;
  }
}

function getEscape(escape: Escape): (string: string) => string {
  if (escape === 'markdown') return escapeMarkdown;
  if (escape === 'slack') return escapeMarkdown;
  if (escape === 'json') return escapeJSON;
  return escapeNone;
}

const BackTick = '`';

// return a backtick'd version of the string, replacing backtick with single quote
function escapeMarkdown(value: string): string {
  if (value == null) return '';

  return `${BackTick}${`${value}`.replace(/`/g, "'") + '`'}${BackTick}`;
}

// replace with JSON stringified version, removing leading and trailing double quote
function escapeJSON(value: string): string {
  if (value == null) return '';

  const quoted = JSON.stringify(`${value}`);
  return quoted.substr(1, quoted.length - 2);
}

function escapeNone(value: string): string {
  if (value == null) return '';

  return `${value}`;
}
