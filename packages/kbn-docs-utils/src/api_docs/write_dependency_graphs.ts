/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import Path from 'path';
import { KibanaPlatformPlugin } from '@kbn/dev-utils';

interface VegaNode {
  name: string;
  group: number;
  index: number;
}

interface VegaLink {
  source: number;
  target: number;
  value: number;
}

export function writeDependencyGraph(outputFolder: string, plugins: KibanaPlatformPlugin[]) {
  const nodes: VegaNode[] = [];
  const links: VegaLink[] = [];
  const groupIds: { [key: string]: number } = {};
  let nextGroupId = 0;
  const indexIds: { [key: string]: number } = {};
  let nextIndex = 0;
  let text = '';

  plugins.forEach((plugin) => {
    const dependencies = [
      ...plugin.manifest.requiredBundles,
      ...plugin.manifest.optionalPlugins,
      ...plugin.manifest.requiredPlugins,
    ];

    if (indexIds[plugin.manifest.id] === undefined) {
      indexIds[plugin.manifest.id] = nextIndex;
      nextIndex++;
    }

    if (groupIds[plugin.manifest.owner.name] === undefined) {
      groupIds[plugin.manifest.owner.name] = nextGroupId;
      nextGroupId++;
    }
    nodes.push({
      name: plugin.manifest.id,
      index: indexIds[plugin.manifest.id],
      group: groupIds[plugin.manifest.owner.name],
    });

    dependencies.forEach((dep) => {
      if (indexIds[dep] === undefined) {
        indexIds[dep] = nextIndex;
        nextIndex++;
      }
      links.push({
        source: indexIds[plugin.manifest.id],
        target: indexIds[dep],
        value: 1,
      });
      text += `${plugin.manifest.id} -> ${dep}\n`;
    });
  });

  fs.writeFileSync(Path.resolve(outputFolder, 'dependencies.tx'), text);
}
