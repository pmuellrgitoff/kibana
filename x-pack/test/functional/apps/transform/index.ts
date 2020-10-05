/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { FtrProviderContext } from '../../ftr_provider_context';

export default function ({ getService, loadTestFile }: FtrProviderContext) {
  const esArchiver = getService('esArchiver');
  const transform = getService('transform');

  describe('transform', function () {
    this.tags(['ciGroup8', 'transform']);

    before(async () => {
      await transform.securityCommon.createTransformRoles();
      await transform.securityCommon.createTransformUsers();
    });

    after(async () => {
      await transform.securityCommon.cleanTransformUsers();
      await transform.securityCommon.cleanTransformRoles();

      await transform.testResources.deleteSavedSearches();

      await transform.testResources.deleteIndexPatternByTitle('ft_farequote');
      await transform.testResources.deleteIndexPatternByTitle('ft_ecommerce');

      await esArchiver.unload('ml/farequote');
      await esArchiver.unload('ml/ecommerce');

      await transform.testResources.resetKibanaTimeZone();
      await transform.securityUI.logout();
    });

    loadTestFile(require.resolve('./creation_index_pattern'));
    loadTestFile(require.resolve('./creation_saved_search'));
    loadTestFile(require.resolve('./cloning'));
    loadTestFile(require.resolve('./editing'));
    loadTestFile(require.resolve('./feature_controls'));
  });
}
