/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import pMap from 'p-map';
import { CasePostRequest, Case, CaseSeverity, CaseStatuses } from '@kbn/cases-plugin/common/api';
import {
  createCase as createCaseAPI,
  deleteAllCaseItems,
  createComment,
  updateCase,
  getCase,
} from '../../../cases_api_integration/common/lib/api';
import {
  loginUsers,
  suggestUserProfiles,
} from '../../../cases_api_integration/common/lib/api/user_profiles';
import { User } from '../../../cases_api_integration/common/lib/authentication/types';

import { FtrProviderContext } from '../../ftr_provider_context';
import { generateRandomCaseWithoutConnector } from './helpers';

type OmitSupertest<T> = Omit<T, 'supertest'>;

export function CasesAPIServiceProvider({ getService }: FtrProviderContext) {
  const kbnSupertest = getService('supertest');
  const es = getService('es');
  const supertestWithoutAuth = getService('supertestWithoutAuth');

  return {
    async createCase(overwrites: Partial<CasePostRequest> = {}): Promise<Case> {
      const caseData = {
        ...generateRandomCaseWithoutConnector(),
        ...overwrites,
      } as CasePostRequest;

      return createCaseAPI(kbnSupertest, caseData);
    },

    async createNthRandomCases(amount: number = 3) {
      const cases: CasePostRequest[] = Array.from(
        { length: amount },
        () => generateRandomCaseWithoutConnector() as CasePostRequest
      );

      await pMap(cases, async (caseData) => createCaseAPI(kbnSupertest, caseData), {
        concurrency: 4,
      });
    },

    async deleteAllCases() {
      await deleteAllCaseItems(es);
    },

    async createAttachment({
      caseId,
      params,
    }: {
      caseId: Parameters<typeof createComment>[0]['caseId'];
      params: Parameters<typeof createComment>[0]['params'];
    }): Promise<Case> {
      return createComment({ supertest: kbnSupertest, params, caseId });
    },

    async setStatus(
      caseId: string,
      caseVersion: string,
      newStatus: 'open' | 'in-progress' | 'closed'
    ) {
      await updateCase({
        supertest: kbnSupertest,
        params: {
          cases: [
            {
              id: caseId,
              version: caseVersion,
              status: CaseStatuses[newStatus],
            },
          ],
        },
      });
    },

    async activateUserProfiles(users: User[]) {
      await loginUsers({
        supertest: supertestWithoutAuth,
        users,
      });
    },

    async suggestUserProfiles(options: Parameters<typeof suggestUserProfiles>[0]['req']) {
      return suggestUserProfiles({ supertest: kbnSupertest, req: options });
    },

    async getCase({ caseId }: OmitSupertest<Parameters<typeof getCase>[0]>): Promise<Case> {
      return getCase({ supertest: kbnSupertest, caseId });
    },

    async generateUserActions({
      caseId,
      caseVersion,
      totalUpdates = 1,
    }: {
      caseId: string;
      caseVersion: string;
      totalUpdates: number;
    }) {
      let latestVersion = caseVersion;
      const severities = Object.values(CaseSeverity);
      const statuses = Object.values(CaseStatuses);

      for (let index = 0; index < totalUpdates; index++) {
        const severity = severities[index % severities.length];
        const status = statuses[index % statuses.length];

        const theCase = await updateCase({
          supertest: kbnSupertest,
          params: {
            cases: [
              {
                id: caseId,
                version: latestVersion,
                title: `Title update ${index}`,
                description: `Desc update ${index}`,
                severity,
                status,
                tags: [`tag-${index}`],
              },
            ],
          },
        });

        latestVersion = theCase[0].version;
      }
    },
  };
}
