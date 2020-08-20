/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import expect from '@kbn/expect';
import { Spaces } from '../../scenarios';
import {
  checkAAD,
  getUrlPrefix,
  getTestAlertData,
  ObjectRemover,
  ensureDatetimesAreOrdered,
} from '../../../common/lib';
import { FtrProviderContext } from '../../../common/ftr_provider_context';

// eslint-disable-next-line import/no-default-export
export default function executionStatusAlertTests({ getService }: FtrProviderContext) {
  const supertest = getService('supertest');

  describe('executionStatus', () => {
    const objectRemover = new ObjectRemover(supertest);

    after(() => objectRemover.removeAll());

    it('should be unknown for newly created alert', async () => {
      const dateStart = Date.now();
      const response = await supertest
        .post(`${getUrlPrefix(Spaces.space1.id)}/api/alerts/alert`)
        .set('kbn-xsrf', 'foo')
        .send(getTestAlertData());
      const dateEnd = Date.now();
      expect(response.status).to.eql(200);
      objectRemover.add(Spaces.space1.id, response.body.id, 'alert', 'alerts');

      expect(response.body.executionStatus).to.be.ok();
      const { status, date, error } = response.body.executionStatus;
      expect(status).to.be('unknown');
      ensureDatetimesAreOrdered([dateStart, date, dateEnd]);
      expect(error).not.to.be.ok();

      // Ensure AAD isn't broken
      await checkAAD({
        supertest,
        spaceId: Spaces.space1.id,
        type: 'alert',
        id: response.body.id,
      });
    });

    it('should eventually be ok for no-op alert', async () => {
      const dates = [];
      dates.push(Date.now());
      const response = await supertest
        .post(`${getUrlPrefix(Spaces.space1.id)}/api/alerts/alert`)
        .set('kbn-xsrf', 'foo')
        .send(
          getTestAlertData({
            alertTypeId: 'test.patternFiring',
            schedule: { interval: '1s' },
            params: {
              pattern: { instance: trues(100) },
            },
          })
        );
      expect(response.status).to.eql(200);
      const alertId = response.body.id;
      dates.push(response.body.executionStatus.date);
      dates.push(Date.now());
      objectRemover.add(Spaces.space1.id, alertId, 'alert', 'alerts');

      const executionStatus = await waitForStatus(alertId, new Set(['active']), 10000);
      dates.push(executionStatus.date);
      dates.push(Date.now());
      ensureDatetimesAreOrdered(dates);
    });
  });

  function trues(length: number): boolean[] {
    return ''
      .padStart(length)
      .split('')
      .map((e) => true);
  }

  const WaitForStatusIncrement = 500;

  async function waitForStatus(
    id: string,
    statuses: Set<string>,
    waitMillis: number
  ): Promise<Record<string, any>> {
    if (waitMillis < 0) {
      expect().fail(`waiting for alert ${id} statuses ${Array.from(statuses)} timed out`);
    }

    const response = await supertest.get(
      `${getUrlPrefix(Spaces.space1.id)}/api/alerts/alert/${id}`
    );
    expect(response.status).to.eql(200);
    const { status } = response.body.executionStatus;
    if (statuses.has(status)) return response.body.executionStatus;

    // eslint-disable-next-line no-console
    console.log(
      `waitForStatus(${Array.from(statuses)}): got ${JSON.stringify(
        response.body.executionStatus
      )}, retrying`
    );
    await delay(WaitForStatusIncrement);
    return waitForStatus(id, statuses, waitMillis - WaitForStatusIncrement);
  }
}

async function delay(millis: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, millis));
}
