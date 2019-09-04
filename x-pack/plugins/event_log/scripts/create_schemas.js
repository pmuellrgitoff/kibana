#!/usr/bin/env node

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

const fs = require('fs');
const path = require('path');

const LineWriter = require('./lib/line_writer');

const PLUGIN_DIR = path.resolve(path.join(__dirname, '..'));
const ECS_SCHEMA_FILE = 'generated/elasticsearch/7/template.json';
const EVENT_LOG_MAPPINGS_FILE = 'generated/mappings.json';
const EVENT_LOG_CONFIG_SCHEMA_FILE = 'generated/schemas.ts';

function main() {
  const ecsDir = getEcsDir();
  const ecsVersion = getEcsVersion(ecsDir);

  const ecsSchema = readEcsJSONFile(ecsDir, ECS_SCHEMA_FILE);

  // add our custom fields
  ecsSchema.mappings.properties.kibana = {
    properties: {
      username: {
        ignore_above: 1024,
        type: 'keyword',
      },
      space_id: {
        ignore_above: 1024,
        type: 'keyword',
      },
      uuid: {
        ignore_above: 1024,
        type: 'keyword',
      }
    }
  };

  const elSchema = getEventLogSchema(ecsSchema);

  console.log(`generating files in ${PLUGIN_DIR}`);
  writeEventLogMappings(elSchema);
  writeEventLogConfigSchema(elSchema, ecsVersion);
}

function writeEventLogMappings(elSchema) {
  // fixObjectTypes(elSchema.mappings);

  const mappings = {
    dynamic: 'strict',
    properties: elSchema.mappings.properties
  };

  writeGeneratedFile(EVENT_LOG_MAPPINGS_FILE, JSON.stringify(mappings, null, 4));
  console.log('generated:', EVENT_LOG_MAPPINGS_FILE);
}

function writeEventLogConfigSchema(elSchema, ecsVersion) {
  let lineWriter;

  lineWriter = LineWriter.createLineWriter();
  generateSchemaLines(lineWriter, null, elSchema.mappings);
  // last line will have an extraneous comma
  const schemaLines = lineWriter.getContent().replace(/,$/, '');

  lineWriter = LineWriter.createLineWriter();
  generateInterfaceLines(lineWriter, null, elSchema.mappings);
  const interfaceLines = lineWriter.getContent().replace(/;$/, '');

  const contents = getSchemaFileContents(ecsVersion, schemaLines, interfaceLines);
  const schemaCode = `${contents}\n`;

  writeGeneratedFile(EVENT_LOG_CONFIG_SCHEMA_FILE, schemaCode);
  console.log('generated:', EVENT_LOG_CONFIG_SCHEMA_FILE);
}

const StringTypes = new Set(['string', 'keyword', 'text', 'ip']);
const NumberTypes = new Set(['long', 'integer', 'float']);

function generateInterfaceLines(lineWriter, prop, mappings) {
  const propKey = legalPropertyName(prop);

  if (StringTypes.has(mappings.type)) {
    lineWriter.addLine(`${propKey}?: string | string[];`);
    return;
  }

  if (NumberTypes.has(mappings.type)) {
    lineWriter.addLine(`${propKey}?: number | number[];`);
    return;
  }

  if (mappings.type === 'date') {
    lineWriter.addLine(`${propKey}?: string | string[];`);
    return;
  }

  if (mappings.type === 'geo_point') {
    lineWriter.addLine(`${propKey}?: GeoPoint | GeoPoint[];`);
    return;
  }

  if (mappings.type === 'object') {
    lineWriter.addLine(`${propKey}?: Record<string, any>;`);
    return;
  }

  // only handling objects for the rest of this function
  if (mappings.properties == null) {
    logError(`unknown properties to map: ${prop}: ${JSON.stringify(mappings)}`);
  }

  // top-level object does not have a property name
  if (prop == null) {
    lineWriter.addLine(`{`);

  } else {
    lineWriter.addLine(`${propKey}?: {`);
  }

  // write the object properties
  lineWriter.indent();
  for (const prop of Object.keys(mappings.properties)) {
    generateInterfaceLines(lineWriter, prop, mappings.properties[prop]);
  }
  lineWriter.dedent();

  lineWriter.addLine('};');
}

function generateSchemaLines(lineWriter, prop, mappings) {
  const propKey = legalPropertyName(prop);

  if (StringTypes.has(mappings.type)) {
    lineWriter.addLine(`${propKey}: ecsString(),`);
    return;
  }

  if (NumberTypes.has(mappings.type)) {
    lineWriter.addLine(`${propKey}: ecsNumber(),`);
    return;
  }

  if (mappings.type === 'date') {
    lineWriter.addLine(`${propKey}: ecsDate(),`);
    return;
  }

  if (mappings.type === 'geo_point') {
    lineWriter.addLine(`${propKey}: ecsGeoPoint(),`);
    return;
  }

  if (mappings.type === 'object') {
    lineWriter.addLine(`${propKey}: ecsOpenObject(),`);
    return;
  }

  // only handling objects for the rest of this function
  if (mappings.properties == null) {
    logError(`unknown properties to map: ${prop}: ${JSON.stringify(mappings)}`);
  }

  // top-level object does not have a property name
  if (prop == null) {
    lineWriter.addLine(`schema.maybe(`);
    lineWriter.indent();
    lineWriter.addLine(`schema.object({`);

  } else {
    lineWriter.addLine(`${propKey}: schema.maybe(`);
    lineWriter.indent();
    lineWriter.addLine(`schema.object({`);
  }

  // write the object properties
  lineWriter.indent();
  for (const prop of Object.keys(mappings.properties)) {
    generateSchemaLines(lineWriter, prop, mappings.properties[prop]);
  }
  lineWriter.dedent();

  lineWriter.addLine('})');
  lineWriter.dedent();
  lineWriter.addLine('),');
}

function legalPropertyName(prop) {
  if (prop === '@timestamp') return `'@timestamp'`;
  return prop;
}

function getEventLogSchema(ecsSchema) {
  return ecsSchema;
}

function readEcsJSONFile(ecsDir, fileName) {
  const contents = readEcsFile(ecsDir, fileName);

  let object;
  try {
    object = JSON.parse(contents);
  } catch (err) {
    logError(`ecs file is not JSON: ${fileName}: ${err.message}`);
  }

  return object;
}

function writeGeneratedFile(fileName, contents) {
  const genFileName = path.join(PLUGIN_DIR, fileName);
  try {
    fs.writeFileSync(genFileName, contents);
  } catch (err) {
    logError(`error writing file: ${genFileName}: ${err.message}`);
  }
}

function readEcsFile(ecsDir, fileName) {
  const ecsFile = path.resolve(path.join(ecsDir, fileName));

  let contents;
  try {
    contents = fs.readFileSync(ecsFile, { encoding: 'utf8' });
  } catch (err) {
    logError(`ecs file not found: ${ecsFile}: ${err.message}`);
  }

  return contents;
}

function getEcsVersion(ecsDir) {
  const contents = readEcsFile(ecsDir, 'version').trim();
  if (!contents.match(/^\d+\.\d+\.\d+$/)) {
    logError(`ecs is not at a stable version: : ${contents}`);
  }

  return contents;
}

function getEcsDir() {
  const ecsDir = path.resolve(path.join(__dirname, '../../../../../ecs'));

  let stats;
  let error;
  try {
    stats = fs.statSync(ecsDir);
  } catch (err) {
    error = err;
  }

  if (error || !stats.isDirectory()) {
    logError(`directory not found: ${ecsDir} - did you checkout elastic/ecs as a peer of this repo?`);
  }

  return ecsDir;
}

function logError(message) {
  console.log(`error: ${message}`);
  process.exit(1);
}

const SchemaFileTemplate = `
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// ---------------------------------- WARNING ----------------------------------
// this file was generated, and should not be edited by hand
// ---------------------------------- WARNING ----------------------------------

// provides TypeScript and config-schema interfaces for ECS for use with
// the event log

import { schema } from '@kbn/config-schema';

export const ECS_VERSION_GENERATED = '%%ECS_VERSION%%';

// a typescript interface describing the schema
export interface IEventGenerated %%INTERFACE%%

// a config-schema  describing the schema
export const EventSchemaGenerated = %%SCHEMA%%;

interface GeoPoint {
  lat?: number;
  lon?: number;
}

function ecsGeoPoint() {
  return schema.maybe(
    schema.object({
      lat: ecsNumber(),
      lon: ecsNumber(),
    })
  );
}

function ecsString() {
  return schema.maybe(schema.oneOf([schema.string(), schema.arrayOf(schema.string())]));
}

function ecsNumber() {
  return schema.maybe(schema.oneOf([schema.number(), schema.arrayOf(schema.number())]));
}

function ecsOpenObject() {
  return schema.maybe(schema.any());
}

function ecsDate() {
  return schema.maybe(schema.string({ validate: validateDate }));
}

const ISO_DATE_PATTERN = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/;

function validateDate(isoDate: string) {
  if (ISO_DATE_PATTERN.test(isoDate)) return;
  return 'string is not a valid ISO date: ' + isoDate;
}
`.trim();

function getSchemaFileContents(ecsVersion, schemaLines, interfaceLines) {
  return SchemaFileTemplate
    .replace('%%ECS_VERSION%%', ecsVersion)
    .replace('%%SCHEMA%%', schemaLines)
    .replace('%%INTERFACE%%', interfaceLines);
}

// run as a command-line script
if (require.main === module) main();
