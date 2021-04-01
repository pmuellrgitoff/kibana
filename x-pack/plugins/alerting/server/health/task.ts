/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { CoreStart, Logger } from 'kibana/server';
import {
  RunContext,
  TaskManagerSetupContract,
  TaskManagerStartContract,
} from '../../../task_manager/server';
import { AlertsConfig } from '../config';
import { AlertingPluginsStart } from '../plugin';
import { HealthStatus } from '../types';
import { getHealth } from './get_health';

export const HEALTH_TASK_TYPE = 'alerting_health_check';

export const HEALTH_TASK_ID = `Alerting-${HEALTH_TASK_TYPE}`;

export function initializeAlertingHealth(
  logger: Logger,
  taskManager: TaskManagerSetupContract,
  coreStartServices: Promise<[CoreStart, AlertingPluginsStart, unknown]>
) {
  registerAlertingHealthCheckTask(logger, taskManager, coreStartServices);
}

export async function scheduleAlertingHealthCheck(
  logger: Logger,
  config: Promise<AlertsConfig>,
  taskManager: TaskManagerStartContract
) {
  try {
    const interval = (await config).healthCheck.interval;
    await taskManager.ensureScheduled({
      id: HEALTH_TASK_ID,
      taskType: HEALTH_TASK_TYPE,
      schedule: {
        interval: '5s',
      },
      state: {},
      params: {},
    });
  } catch (e) {
    logger.debug(`Error scheduling task, received ${e.message}`);
  }
}

function registerAlertingHealthCheckTask(
  logger: Logger,
  taskManager: TaskManagerSetupContract,
  coreStartServices: Promise<[CoreStart, AlertingPluginsStart, unknown]>
) {
  taskManager.registerTaskDefinitions({
    [HEALTH_TASK_TYPE]: {
      title: 'Alerting framework health check task',
      createTaskRunner: healthCheckTaskRunner(logger, coreStartServices),
      timeout: '2s',
    },
  });
}

export function healthCheckTaskRunner(
  logger: Logger,
  coreStartServices: Promise<[CoreStart, AlertingPluginsStart, unknown]>
) {
  let taskRunCount: number = 0;
  return ({ taskInstance }: RunContext) => {
    const { state } = taskInstance;
    return {
      async cancel() {
        console.log(`${new Date().toISOString()} - cancel() called`)
      },

      async run() {
        taskRunCount++;
        const localTaskRunCount = taskRunCount;
        console.log(`${localTaskRunCount} - ${new Date().toISOString()} - starting healthCheck task`)
        try {
          const alertingHealthStatus = await getHealth(
            (await coreStartServices)[0].savedObjects.createInternalRepository(['alert'])
          );
          console.log(`${localTaskRunCount} - ${new Date().toISOString()} - ending healthChecktask: success`)
          console.log(`${localTaskRunCount} - ${new Date().toISOString()} - but waiting another 10 seconds anyway`)
          await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
          console.log(`${localTaskRunCount} - ${new Date().toISOString()} - ending healthChecktask for reals`)
          return {
            state: {
              runs: (state.runs || 0) + 1,
              health_status: alertingHealthStatus.decryptionHealth.status,
            },
          };
        } catch (errMsg) {
          logger.warn(`Error executing alerting health check task: ${errMsg}`);
          console.log(`${localTaskRunCount} - ending healthCheck task: error`)
          return {
            state: {
              runs: (state.runs || 0) + 1,
              health_status: HealthStatus.Error,
            },
          };
        }
      },
    };
  };
}
