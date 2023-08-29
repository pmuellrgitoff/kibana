/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LeftPanelContext } from '../context';
import { TestProviders } from '../../../common/mock';
import { EntitiesDetails } from './entities_details';
import {
  ENTITIES_DETAILS_NO_DATA_TEST_ID,
  ENTITIES_DETAILS_TEST_ID,
  HOST_DETAILS_TEST_ID,
  USER_DETAILS_TEST_ID,
} from './test_ids';
import { mockContextValue } from '../mocks/mock_context';
import { EXPANDABLE_PANEL_CONTENT_TEST_ID } from '../../shared/components/test_ids';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useLocation: jest.fn().mockReturnValue({ pathname: '' }) };
});

jest.mock('../../../resolver/view/use_resolver_query_params_cleaner');

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  const original = jest.requireActual('react-redux');

  return {
    ...original,
    useDispatch: () => mockDispatch,
  };
});

const USER_TEST_ID = EXPANDABLE_PANEL_CONTENT_TEST_ID(USER_DETAILS_TEST_ID);
const HOST_TEST_ID = EXPANDABLE_PANEL_CONTENT_TEST_ID(HOST_DETAILS_TEST_ID);

describe('<EntitiesDetails />', () => {
  it('renders entities details correctly', () => {
    const { getByTestId } = render(
      <TestProviders>
        <LeftPanelContext.Provider value={mockContextValue}>
          <EntitiesDetails />
        </LeftPanelContext.Provider>
      </TestProviders>
    );
    expect(getByTestId(ENTITIES_DETAILS_TEST_ID)).toBeInTheDocument();
    expect(getByTestId(USER_TEST_ID)).toBeInTheDocument();
    expect(getByTestId(HOST_TEST_ID)).toBeInTheDocument();
  });

  it('should render no data message if user name and host name are not available', () => {
    const { getByTestId, queryByTestId } = render(
      <TestProviders>
        <LeftPanelContext.Provider
          value={{
            ...mockContextValue,
            getFieldsData: (fieldName) =>
              fieldName === '@timestamp' ? ['2022-07-25T08:20:18.966Z'] : [],
          }}
        >
          <EntitiesDetails />
        </LeftPanelContext.Provider>
      </TestProviders>
    );
    expect(getByTestId(ENTITIES_DETAILS_NO_DATA_TEST_ID)).toBeInTheDocument();
    expect(queryByTestId(USER_TEST_ID)).not.toBeInTheDocument();
    expect(queryByTestId(HOST_TEST_ID)).not.toBeInTheDocument();
  });

  it('does not render user and host details if @timestamp is not available', () => {
    const { getByTestId, queryByTestId } = render(
      <TestProviders>
        <LeftPanelContext.Provider
          value={{
            ...mockContextValue,
            getFieldsData: (fieldName) => {
              switch (fieldName) {
                case 'host.name':
                  return ['host1'];
                case 'user.name':
                  return ['user1'];
                default:
                  return [];
              }
            },
          }}
        >
          <EntitiesDetails />
        </LeftPanelContext.Provider>
      </TestProviders>
    );
    expect(getByTestId(ENTITIES_DETAILS_NO_DATA_TEST_ID)).toBeInTheDocument();
    expect(queryByTestId(USER_TEST_ID)).not.toBeInTheDocument();
    expect(queryByTestId(HOST_TEST_ID)).not.toBeInTheDocument();
  });
});
