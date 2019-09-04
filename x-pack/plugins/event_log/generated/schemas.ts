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

export const ECS_VERSION_GENERATED = '1.2.0';

// a typescript interface describing the schema
export interface IEventGenerated {
  '@timestamp'?: string | string[];
  agent?: {
    ephemeral_id?: string | string[];
    id?: string | string[];
    name?: string | string[];
    type?: string | string[];
    version?: string | string[];
  };
  as?: {
    number?: number | number[];
    organization?: {
      name?: string | string[];
    };
  };
  client?: {
    address?: string | string[];
    as?: {
      number?: number | number[];
      organization?: {
        name?: string | string[];
      };
    };
    bytes?: number | number[];
    domain?: string | string[];
    geo?: {
      city_name?: string | string[];
      continent_name?: string | string[];
      country_iso_code?: string | string[];
      country_name?: string | string[];
      location?: GeoPoint | GeoPoint[];
      name?: string | string[];
      region_iso_code?: string | string[];
      region_name?: string | string[];
    };
    ip?: string | string[];
    mac?: string | string[];
    nat?: {
      ip?: string | string[];
      port?: number | number[];
    };
    packets?: number | number[];
    port?: number | number[];
    registered_domain?: string | string[];
    top_level_domain?: string | string[];
    user?: {
      domain?: string | string[];
      email?: string | string[];
      full_name?: string | string[];
      group?: {
        domain?: string | string[];
        id?: string | string[];
        name?: string | string[];
      };
      hash?: string | string[];
      id?: string | string[];
      name?: string | string[];
    };
  };
  cloud?: {
    account?: {
      id?: string | string[];
    };
    availability_zone?: string | string[];
    instance?: {
      id?: string | string[];
      name?: string | string[];
    };
    machine?: {
      type?: string | string[];
    };
    provider?: string | string[];
    region?: string | string[];
  };
  container?: {
    id?: string | string[];
    image?: {
      name?: string | string[];
      tag?: string | string[];
    };
    labels?: Record<string, any>;
    name?: string | string[];
    runtime?: string | string[];
  };
  destination?: {
    address?: string | string[];
    as?: {
      number?: number | number[];
      organization?: {
        name?: string | string[];
      };
    };
    bytes?: number | number[];
    domain?: string | string[];
    geo?: {
      city_name?: string | string[];
      continent_name?: string | string[];
      country_iso_code?: string | string[];
      country_name?: string | string[];
      location?: GeoPoint | GeoPoint[];
      name?: string | string[];
      region_iso_code?: string | string[];
      region_name?: string | string[];
    };
    ip?: string | string[];
    mac?: string | string[];
    nat?: {
      ip?: string | string[];
      port?: number | number[];
    };
    packets?: number | number[];
    port?: number | number[];
    registered_domain?: string | string[];
    top_level_domain?: string | string[];
    user?: {
      domain?: string | string[];
      email?: string | string[];
      full_name?: string | string[];
      group?: {
        domain?: string | string[];
        id?: string | string[];
        name?: string | string[];
      };
      hash?: string | string[];
      id?: string | string[];
      name?: string | string[];
    };
  };
  dns?: {
    answers?: {
      class?: string | string[];
      data?: string | string[];
      name?: string | string[];
      ttl?: number | number[];
      type?: string | string[];
    };
    header_flags?: string | string[];
    id?: string | string[];
    op_code?: string | string[];
    question?: {
      class?: string | string[];
      name?: string | string[];
      registered_domain?: string | string[];
      subdomain?: string | string[];
      top_level_domain?: string | string[];
      type?: string | string[];
    };
    resolved_ip?: string | string[];
    response_code?: string | string[];
    type?: string | string[];
  };
  ecs?: {
    version?: string | string[];
  };
  error?: {
    code?: string | string[];
    id?: string | string[];
    message?: string | string[];
    stack_trace?: string | string[];
    type?: string | string[];
  };
  event?: {
    action?: string | string[];
    category?: string | string[];
    code?: string | string[];
    created?: string | string[];
    dataset?: string | string[];
    duration?: number | number[];
    end?: string | string[];
    hash?: string | string[];
    id?: string | string[];
    kind?: string | string[];
    module?: string | string[];
    original?: string | string[];
    outcome?: string | string[];
    provider?: string | string[];
    risk_score?: number | number[];
    risk_score_norm?: number | number[];
    sequence?: number | number[];
    severity?: number | number[];
    start?: string | string[];
    timezone?: string | string[];
    type?: string | string[];
  };
  file?: {
    accessed?: string | string[];
    created?: string | string[];
    ctime?: string | string[];
    device?: string | string[];
    directory?: string | string[];
    extension?: string | string[];
    gid?: string | string[];
    group?: string | string[];
    hash?: {
      md5?: string | string[];
      sha1?: string | string[];
      sha256?: string | string[];
      sha512?: string | string[];
    };
    inode?: string | string[];
    mode?: string | string[];
    mtime?: string | string[];
    name?: string | string[];
    owner?: string | string[];
    path?: string | string[];
    size?: number | number[];
    target_path?: string | string[];
    type?: string | string[];
    uid?: string | string[];
  };
  geo?: {
    city_name?: string | string[];
    continent_name?: string | string[];
    country_iso_code?: string | string[];
    country_name?: string | string[];
    location?: GeoPoint | GeoPoint[];
    name?: string | string[];
    region_iso_code?: string | string[];
    region_name?: string | string[];
  };
  group?: {
    domain?: string | string[];
    id?: string | string[];
    name?: string | string[];
  };
  hash?: {
    md5?: string | string[];
    sha1?: string | string[];
    sha256?: string | string[];
    sha512?: string | string[];
  };
  host?: {
    architecture?: string | string[];
    geo?: {
      city_name?: string | string[];
      continent_name?: string | string[];
      country_iso_code?: string | string[];
      country_name?: string | string[];
      location?: GeoPoint | GeoPoint[];
      name?: string | string[];
      region_iso_code?: string | string[];
      region_name?: string | string[];
    };
    hostname?: string | string[];
    id?: string | string[];
    ip?: string | string[];
    mac?: string | string[];
    name?: string | string[];
    os?: {
      family?: string | string[];
      full?: string | string[];
      kernel?: string | string[];
      name?: string | string[];
      platform?: string | string[];
      version?: string | string[];
    };
    type?: string | string[];
    uptime?: number | number[];
    user?: {
      domain?: string | string[];
      email?: string | string[];
      full_name?: string | string[];
      group?: {
        domain?: string | string[];
        id?: string | string[];
        name?: string | string[];
      };
      hash?: string | string[];
      id?: string | string[];
      name?: string | string[];
    };
  };
  http?: {
    request?: {
      body?: {
        bytes?: number | number[];
        content?: string | string[];
      };
      bytes?: number | number[];
      method?: string | string[];
      referrer?: string | string[];
    };
    response?: {
      body?: {
        bytes?: number | number[];
        content?: string | string[];
      };
      bytes?: number | number[];
      status_code?: number | number[];
    };
    version?: string | string[];
  };
  labels?: Record<string, any>;
  log?: {
    level?: string | string[];
    logger?: string | string[];
    origin?: {
      file?: {
        line?: number | number[];
        name?: string | string[];
      };
      function?: string | string[];
    };
    original?: string | string[];
    syslog?: {
      facility?: {
        code?: number | number[];
        name?: string | string[];
      };
      priority?: number | number[];
      severity?: {
        code?: number | number[];
        name?: string | string[];
      };
    };
  };
  message?: string | string[];
  network?: {
    application?: string | string[];
    bytes?: number | number[];
    community_id?: string | string[];
    direction?: string | string[];
    forwarded_ip?: string | string[];
    iana_number?: string | string[];
    name?: string | string[];
    packets?: number | number[];
    protocol?: string | string[];
    transport?: string | string[];
    type?: string | string[];
  };
  observer?: {
    geo?: {
      city_name?: string | string[];
      continent_name?: string | string[];
      country_iso_code?: string | string[];
      country_name?: string | string[];
      location?: GeoPoint | GeoPoint[];
      name?: string | string[];
      region_iso_code?: string | string[];
      region_name?: string | string[];
    };
    hostname?: string | string[];
    ip?: string | string[];
    mac?: string | string[];
    name?: string | string[];
    os?: {
      family?: string | string[];
      full?: string | string[];
      kernel?: string | string[];
      name?: string | string[];
      platform?: string | string[];
      version?: string | string[];
    };
    product?: string | string[];
    serial_number?: string | string[];
    type?: string | string[];
    vendor?: string | string[];
    version?: string | string[];
  };
  organization?: {
    id?: string | string[];
    name?: string | string[];
  };
  os?: {
    family?: string | string[];
    full?: string | string[];
    kernel?: string | string[];
    name?: string | string[];
    platform?: string | string[];
    version?: string | string[];
  };
  package?: {
    architecture?: string | string[];
    checksum?: string | string[];
    description?: string | string[];
    install_scope?: string | string[];
    installed?: string | string[];
    license?: string | string[];
    name?: string | string[];
    path?: string | string[];
    size?: number | number[];
    version?: string | string[];
  };
  process?: {
    args?: string | string[];
    executable?: string | string[];
    hash?: {
      md5?: string | string[];
      sha1?: string | string[];
      sha256?: string | string[];
      sha512?: string | string[];
    };
    name?: string | string[];
    pgid?: number | number[];
    pid?: number | number[];
    ppid?: number | number[];
    start?: string | string[];
    thread?: {
      id?: number | number[];
      name?: string | string[];
    };
    title?: string | string[];
    uptime?: number | number[];
    working_directory?: string | string[];
  };
  related?: {
    ip?: string | string[];
  };
  server?: {
    address?: string | string[];
    as?: {
      number?: number | number[];
      organization?: {
        name?: string | string[];
      };
    };
    bytes?: number | number[];
    domain?: string | string[];
    geo?: {
      city_name?: string | string[];
      continent_name?: string | string[];
      country_iso_code?: string | string[];
      country_name?: string | string[];
      location?: GeoPoint | GeoPoint[];
      name?: string | string[];
      region_iso_code?: string | string[];
      region_name?: string | string[];
    };
    ip?: string | string[];
    mac?: string | string[];
    nat?: {
      ip?: string | string[];
      port?: number | number[];
    };
    packets?: number | number[];
    port?: number | number[];
    registered_domain?: string | string[];
    top_level_domain?: string | string[];
    user?: {
      domain?: string | string[];
      email?: string | string[];
      full_name?: string | string[];
      group?: {
        domain?: string | string[];
        id?: string | string[];
        name?: string | string[];
      };
      hash?: string | string[];
      id?: string | string[];
      name?: string | string[];
    };
  };
  service?: {
    ephemeral_id?: string | string[];
    id?: string | string[];
    name?: string | string[];
    node?: {
      name?: string | string[];
    };
    state?: string | string[];
    type?: string | string[];
    version?: string | string[];
  };
  source?: {
    address?: string | string[];
    as?: {
      number?: number | number[];
      organization?: {
        name?: string | string[];
      };
    };
    bytes?: number | number[];
    domain?: string | string[];
    geo?: {
      city_name?: string | string[];
      continent_name?: string | string[];
      country_iso_code?: string | string[];
      country_name?: string | string[];
      location?: GeoPoint | GeoPoint[];
      name?: string | string[];
      region_iso_code?: string | string[];
      region_name?: string | string[];
    };
    ip?: string | string[];
    mac?: string | string[];
    nat?: {
      ip?: string | string[];
      port?: number | number[];
    };
    packets?: number | number[];
    port?: number | number[];
    registered_domain?: string | string[];
    top_level_domain?: string | string[];
    user?: {
      domain?: string | string[];
      email?: string | string[];
      full_name?: string | string[];
      group?: {
        domain?: string | string[];
        id?: string | string[];
        name?: string | string[];
      };
      hash?: string | string[];
      id?: string | string[];
      name?: string | string[];
    };
  };
  tags?: string | string[];
  threat?: {
    framework?: string | string[];
    tactic?: {
      id?: string | string[];
      name?: string | string[];
      reference?: string | string[];
    };
    technique?: {
      id?: string | string[];
      name?: string | string[];
      reference?: string | string[];
    };
  };
  trace?: {
    id?: string | string[];
  };
  transaction?: {
    id?: string | string[];
  };
  url?: {
    domain?: string | string[];
    extension?: string | string[];
    fragment?: string | string[];
    full?: string | string[];
    original?: string | string[];
    password?: string | string[];
    path?: string | string[];
    port?: number | number[];
    query?: string | string[];
    registered_domain?: string | string[];
    scheme?: string | string[];
    top_level_domain?: string | string[];
    username?: string | string[];
  };
  user?: {
    domain?: string | string[];
    email?: string | string[];
    full_name?: string | string[];
    group?: {
      domain?: string | string[];
      id?: string | string[];
      name?: string | string[];
    };
    hash?: string | string[];
    id?: string | string[];
    name?: string | string[];
  };
  user_agent?: {
    device?: {
      name?: string | string[];
    };
    name?: string | string[];
    original?: string | string[];
    os?: {
      family?: string | string[];
      full?: string | string[];
      kernel?: string | string[];
      name?: string | string[];
      platform?: string | string[];
      version?: string | string[];
    };
    version?: string | string[];
  };
  kibana?: {
    username?: string | string[];
    space_id?: string | string[];
    uuid?: string | string[];
  };
}

// a config-schema  describing the schema
export const EventSchemaGenerated = schema.maybe(
  schema.object({
    '@timestamp': ecsDate(),
    agent: schema.maybe(
      schema.object({
        ephemeral_id: ecsString(),
        id: ecsString(),
        name: ecsString(),
        type: ecsString(),
        version: ecsString(),
      })
    ),
    as: schema.maybe(
      schema.object({
        number: ecsNumber(),
        organization: schema.maybe(
          schema.object({
            name: ecsString(),
          })
        ),
      })
    ),
    client: schema.maybe(
      schema.object({
        address: ecsString(),
        as: schema.maybe(
          schema.object({
            number: ecsNumber(),
            organization: schema.maybe(
              schema.object({
                name: ecsString(),
              })
            ),
          })
        ),
        bytes: ecsNumber(),
        domain: ecsString(),
        geo: schema.maybe(
          schema.object({
            city_name: ecsString(),
            continent_name: ecsString(),
            country_iso_code: ecsString(),
            country_name: ecsString(),
            location: ecsGeoPoint(),
            name: ecsString(),
            region_iso_code: ecsString(),
            region_name: ecsString(),
          })
        ),
        ip: ecsString(),
        mac: ecsString(),
        nat: schema.maybe(
          schema.object({
            ip: ecsString(),
            port: ecsNumber(),
          })
        ),
        packets: ecsNumber(),
        port: ecsNumber(),
        registered_domain: ecsString(),
        top_level_domain: ecsString(),
        user: schema.maybe(
          schema.object({
            domain: ecsString(),
            email: ecsString(),
            full_name: ecsString(),
            group: schema.maybe(
              schema.object({
                domain: ecsString(),
                id: ecsString(),
                name: ecsString(),
              })
            ),
            hash: ecsString(),
            id: ecsString(),
            name: ecsString(),
          })
        ),
      })
    ),
    cloud: schema.maybe(
      schema.object({
        account: schema.maybe(
          schema.object({
            id: ecsString(),
          })
        ),
        availability_zone: ecsString(),
        instance: schema.maybe(
          schema.object({
            id: ecsString(),
            name: ecsString(),
          })
        ),
        machine: schema.maybe(
          schema.object({
            type: ecsString(),
          })
        ),
        provider: ecsString(),
        region: ecsString(),
      })
    ),
    container: schema.maybe(
      schema.object({
        id: ecsString(),
        image: schema.maybe(
          schema.object({
            name: ecsString(),
            tag: ecsString(),
          })
        ),
        labels: ecsOpenObject(),
        name: ecsString(),
        runtime: ecsString(),
      })
    ),
    destination: schema.maybe(
      schema.object({
        address: ecsString(),
        as: schema.maybe(
          schema.object({
            number: ecsNumber(),
            organization: schema.maybe(
              schema.object({
                name: ecsString(),
              })
            ),
          })
        ),
        bytes: ecsNumber(),
        domain: ecsString(),
        geo: schema.maybe(
          schema.object({
            city_name: ecsString(),
            continent_name: ecsString(),
            country_iso_code: ecsString(),
            country_name: ecsString(),
            location: ecsGeoPoint(),
            name: ecsString(),
            region_iso_code: ecsString(),
            region_name: ecsString(),
          })
        ),
        ip: ecsString(),
        mac: ecsString(),
        nat: schema.maybe(
          schema.object({
            ip: ecsString(),
            port: ecsNumber(),
          })
        ),
        packets: ecsNumber(),
        port: ecsNumber(),
        registered_domain: ecsString(),
        top_level_domain: ecsString(),
        user: schema.maybe(
          schema.object({
            domain: ecsString(),
            email: ecsString(),
            full_name: ecsString(),
            group: schema.maybe(
              schema.object({
                domain: ecsString(),
                id: ecsString(),
                name: ecsString(),
              })
            ),
            hash: ecsString(),
            id: ecsString(),
            name: ecsString(),
          })
        ),
      })
    ),
    dns: schema.maybe(
      schema.object({
        answers: schema.maybe(
          schema.object({
            class: ecsString(),
            data: ecsString(),
            name: ecsString(),
            ttl: ecsNumber(),
            type: ecsString(),
          })
        ),
        header_flags: ecsString(),
        id: ecsString(),
        op_code: ecsString(),
        question: schema.maybe(
          schema.object({
            class: ecsString(),
            name: ecsString(),
            registered_domain: ecsString(),
            subdomain: ecsString(),
            top_level_domain: ecsString(),
            type: ecsString(),
          })
        ),
        resolved_ip: ecsString(),
        response_code: ecsString(),
        type: ecsString(),
      })
    ),
    ecs: schema.maybe(
      schema.object({
        version: ecsString(),
      })
    ),
    error: schema.maybe(
      schema.object({
        code: ecsString(),
        id: ecsString(),
        message: ecsString(),
        stack_trace: ecsString(),
        type: ecsString(),
      })
    ),
    event: schema.maybe(
      schema.object({
        action: ecsString(),
        category: ecsString(),
        code: ecsString(),
        created: ecsDate(),
        dataset: ecsString(),
        duration: ecsNumber(),
        end: ecsDate(),
        hash: ecsString(),
        id: ecsString(),
        kind: ecsString(),
        module: ecsString(),
        original: ecsString(),
        outcome: ecsString(),
        provider: ecsString(),
        risk_score: ecsNumber(),
        risk_score_norm: ecsNumber(),
        sequence: ecsNumber(),
        severity: ecsNumber(),
        start: ecsDate(),
        timezone: ecsString(),
        type: ecsString(),
      })
    ),
    file: schema.maybe(
      schema.object({
        accessed: ecsDate(),
        created: ecsDate(),
        ctime: ecsDate(),
        device: ecsString(),
        directory: ecsString(),
        extension: ecsString(),
        gid: ecsString(),
        group: ecsString(),
        hash: schema.maybe(
          schema.object({
            md5: ecsString(),
            sha1: ecsString(),
            sha256: ecsString(),
            sha512: ecsString(),
          })
        ),
        inode: ecsString(),
        mode: ecsString(),
        mtime: ecsDate(),
        name: ecsString(),
        owner: ecsString(),
        path: ecsString(),
        size: ecsNumber(),
        target_path: ecsString(),
        type: ecsString(),
        uid: ecsString(),
      })
    ),
    geo: schema.maybe(
      schema.object({
        city_name: ecsString(),
        continent_name: ecsString(),
        country_iso_code: ecsString(),
        country_name: ecsString(),
        location: ecsGeoPoint(),
        name: ecsString(),
        region_iso_code: ecsString(),
        region_name: ecsString(),
      })
    ),
    group: schema.maybe(
      schema.object({
        domain: ecsString(),
        id: ecsString(),
        name: ecsString(),
      })
    ),
    hash: schema.maybe(
      schema.object({
        md5: ecsString(),
        sha1: ecsString(),
        sha256: ecsString(),
        sha512: ecsString(),
      })
    ),
    host: schema.maybe(
      schema.object({
        architecture: ecsString(),
        geo: schema.maybe(
          schema.object({
            city_name: ecsString(),
            continent_name: ecsString(),
            country_iso_code: ecsString(),
            country_name: ecsString(),
            location: ecsGeoPoint(),
            name: ecsString(),
            region_iso_code: ecsString(),
            region_name: ecsString(),
          })
        ),
        hostname: ecsString(),
        id: ecsString(),
        ip: ecsString(),
        mac: ecsString(),
        name: ecsString(),
        os: schema.maybe(
          schema.object({
            family: ecsString(),
            full: ecsString(),
            kernel: ecsString(),
            name: ecsString(),
            platform: ecsString(),
            version: ecsString(),
          })
        ),
        type: ecsString(),
        uptime: ecsNumber(),
        user: schema.maybe(
          schema.object({
            domain: ecsString(),
            email: ecsString(),
            full_name: ecsString(),
            group: schema.maybe(
              schema.object({
                domain: ecsString(),
                id: ecsString(),
                name: ecsString(),
              })
            ),
            hash: ecsString(),
            id: ecsString(),
            name: ecsString(),
          })
        ),
      })
    ),
    http: schema.maybe(
      schema.object({
        request: schema.maybe(
          schema.object({
            body: schema.maybe(
              schema.object({
                bytes: ecsNumber(),
                content: ecsString(),
              })
            ),
            bytes: ecsNumber(),
            method: ecsString(),
            referrer: ecsString(),
          })
        ),
        response: schema.maybe(
          schema.object({
            body: schema.maybe(
              schema.object({
                bytes: ecsNumber(),
                content: ecsString(),
              })
            ),
            bytes: ecsNumber(),
            status_code: ecsNumber(),
          })
        ),
        version: ecsString(),
      })
    ),
    labels: ecsOpenObject(),
    log: schema.maybe(
      schema.object({
        level: ecsString(),
        logger: ecsString(),
        origin: schema.maybe(
          schema.object({
            file: schema.maybe(
              schema.object({
                line: ecsNumber(),
                name: ecsString(),
              })
            ),
            function: ecsString(),
          })
        ),
        original: ecsString(),
        syslog: schema.maybe(
          schema.object({
            facility: schema.maybe(
              schema.object({
                code: ecsNumber(),
                name: ecsString(),
              })
            ),
            priority: ecsNumber(),
            severity: schema.maybe(
              schema.object({
                code: ecsNumber(),
                name: ecsString(),
              })
            ),
          })
        ),
      })
    ),
    message: ecsString(),
    network: schema.maybe(
      schema.object({
        application: ecsString(),
        bytes: ecsNumber(),
        community_id: ecsString(),
        direction: ecsString(),
        forwarded_ip: ecsString(),
        iana_number: ecsString(),
        name: ecsString(),
        packets: ecsNumber(),
        protocol: ecsString(),
        transport: ecsString(),
        type: ecsString(),
      })
    ),
    observer: schema.maybe(
      schema.object({
        geo: schema.maybe(
          schema.object({
            city_name: ecsString(),
            continent_name: ecsString(),
            country_iso_code: ecsString(),
            country_name: ecsString(),
            location: ecsGeoPoint(),
            name: ecsString(),
            region_iso_code: ecsString(),
            region_name: ecsString(),
          })
        ),
        hostname: ecsString(),
        ip: ecsString(),
        mac: ecsString(),
        name: ecsString(),
        os: schema.maybe(
          schema.object({
            family: ecsString(),
            full: ecsString(),
            kernel: ecsString(),
            name: ecsString(),
            platform: ecsString(),
            version: ecsString(),
          })
        ),
        product: ecsString(),
        serial_number: ecsString(),
        type: ecsString(),
        vendor: ecsString(),
        version: ecsString(),
      })
    ),
    organization: schema.maybe(
      schema.object({
        id: ecsString(),
        name: ecsString(),
      })
    ),
    os: schema.maybe(
      schema.object({
        family: ecsString(),
        full: ecsString(),
        kernel: ecsString(),
        name: ecsString(),
        platform: ecsString(),
        version: ecsString(),
      })
    ),
    package: schema.maybe(
      schema.object({
        architecture: ecsString(),
        checksum: ecsString(),
        description: ecsString(),
        install_scope: ecsString(),
        installed: ecsDate(),
        license: ecsString(),
        name: ecsString(),
        path: ecsString(),
        size: ecsNumber(),
        version: ecsString(),
      })
    ),
    process: schema.maybe(
      schema.object({
        args: ecsString(),
        executable: ecsString(),
        hash: schema.maybe(
          schema.object({
            md5: ecsString(),
            sha1: ecsString(),
            sha256: ecsString(),
            sha512: ecsString(),
          })
        ),
        name: ecsString(),
        pgid: ecsNumber(),
        pid: ecsNumber(),
        ppid: ecsNumber(),
        start: ecsDate(),
        thread: schema.maybe(
          schema.object({
            id: ecsNumber(),
            name: ecsString(),
          })
        ),
        title: ecsString(),
        uptime: ecsNumber(),
        working_directory: ecsString(),
      })
    ),
    related: schema.maybe(
      schema.object({
        ip: ecsString(),
      })
    ),
    server: schema.maybe(
      schema.object({
        address: ecsString(),
        as: schema.maybe(
          schema.object({
            number: ecsNumber(),
            organization: schema.maybe(
              schema.object({
                name: ecsString(),
              })
            ),
          })
        ),
        bytes: ecsNumber(),
        domain: ecsString(),
        geo: schema.maybe(
          schema.object({
            city_name: ecsString(),
            continent_name: ecsString(),
            country_iso_code: ecsString(),
            country_name: ecsString(),
            location: ecsGeoPoint(),
            name: ecsString(),
            region_iso_code: ecsString(),
            region_name: ecsString(),
          })
        ),
        ip: ecsString(),
        mac: ecsString(),
        nat: schema.maybe(
          schema.object({
            ip: ecsString(),
            port: ecsNumber(),
          })
        ),
        packets: ecsNumber(),
        port: ecsNumber(),
        registered_domain: ecsString(),
        top_level_domain: ecsString(),
        user: schema.maybe(
          schema.object({
            domain: ecsString(),
            email: ecsString(),
            full_name: ecsString(),
            group: schema.maybe(
              schema.object({
                domain: ecsString(),
                id: ecsString(),
                name: ecsString(),
              })
            ),
            hash: ecsString(),
            id: ecsString(),
            name: ecsString(),
          })
        ),
      })
    ),
    service: schema.maybe(
      schema.object({
        ephemeral_id: ecsString(),
        id: ecsString(),
        name: ecsString(),
        node: schema.maybe(
          schema.object({
            name: ecsString(),
          })
        ),
        state: ecsString(),
        type: ecsString(),
        version: ecsString(),
      })
    ),
    source: schema.maybe(
      schema.object({
        address: ecsString(),
        as: schema.maybe(
          schema.object({
            number: ecsNumber(),
            organization: schema.maybe(
              schema.object({
                name: ecsString(),
              })
            ),
          })
        ),
        bytes: ecsNumber(),
        domain: ecsString(),
        geo: schema.maybe(
          schema.object({
            city_name: ecsString(),
            continent_name: ecsString(),
            country_iso_code: ecsString(),
            country_name: ecsString(),
            location: ecsGeoPoint(),
            name: ecsString(),
            region_iso_code: ecsString(),
            region_name: ecsString(),
          })
        ),
        ip: ecsString(),
        mac: ecsString(),
        nat: schema.maybe(
          schema.object({
            ip: ecsString(),
            port: ecsNumber(),
          })
        ),
        packets: ecsNumber(),
        port: ecsNumber(),
        registered_domain: ecsString(),
        top_level_domain: ecsString(),
        user: schema.maybe(
          schema.object({
            domain: ecsString(),
            email: ecsString(),
            full_name: ecsString(),
            group: schema.maybe(
              schema.object({
                domain: ecsString(),
                id: ecsString(),
                name: ecsString(),
              })
            ),
            hash: ecsString(),
            id: ecsString(),
            name: ecsString(),
          })
        ),
      })
    ),
    tags: ecsString(),
    threat: schema.maybe(
      schema.object({
        framework: ecsString(),
        tactic: schema.maybe(
          schema.object({
            id: ecsString(),
            name: ecsString(),
            reference: ecsString(),
          })
        ),
        technique: schema.maybe(
          schema.object({
            id: ecsString(),
            name: ecsString(),
            reference: ecsString(),
          })
        ),
      })
    ),
    trace: schema.maybe(
      schema.object({
        id: ecsString(),
      })
    ),
    transaction: schema.maybe(
      schema.object({
        id: ecsString(),
      })
    ),
    url: schema.maybe(
      schema.object({
        domain: ecsString(),
        extension: ecsString(),
        fragment: ecsString(),
        full: ecsString(),
        original: ecsString(),
        password: ecsString(),
        path: ecsString(),
        port: ecsNumber(),
        query: ecsString(),
        registered_domain: ecsString(),
        scheme: ecsString(),
        top_level_domain: ecsString(),
        username: ecsString(),
      })
    ),
    user: schema.maybe(
      schema.object({
        domain: ecsString(),
        email: ecsString(),
        full_name: ecsString(),
        group: schema.maybe(
          schema.object({
            domain: ecsString(),
            id: ecsString(),
            name: ecsString(),
          })
        ),
        hash: ecsString(),
        id: ecsString(),
        name: ecsString(),
      })
    ),
    user_agent: schema.maybe(
      schema.object({
        device: schema.maybe(
          schema.object({
            name: ecsString(),
          })
        ),
        name: ecsString(),
        original: ecsString(),
        os: schema.maybe(
          schema.object({
            family: ecsString(),
            full: ecsString(),
            kernel: ecsString(),
            name: ecsString(),
            platform: ecsString(),
            version: ecsString(),
          })
        ),
        version: ecsString(),
      })
    ),
    kibana: schema.maybe(
      schema.object({
        username: ecsString(),
        space_id: ecsString(),
        uuid: ecsString(),
      })
    ),
  })
);

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

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function validateDate(isoDate: string) {
  if (ISO_DATE_PATTERN.test(isoDate)) return;
  return 'string is not a valid ISO date: ' + isoDate;
}
