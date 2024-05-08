import {OrganizationFixture} from 'sentry-fixture/organization';

import {render, screen, waitForElementToBeRemoved} from 'sentry-test/reactTestingLibrary';

import {useLocation} from 'sentry/utils/useLocation';
import useOrganization from 'sentry/utils/useOrganization';
import usePageFilters from 'sentry/utils/usePageFilters';
import useProjects from 'sentry/utils/useProjects';
import QueuesLandingPage from 'sentry/views/performance/queues/queuesLandingPage';

jest.mock('sentry/utils/useLocation');
jest.mock('sentry/utils/usePageFilters');
jest.mock('sentry/utils/useOrganization');
jest.mock('sentry/utils/useProjects');

describe('queuesLandingPage', () => {
  const organization = OrganizationFixture({features: ['performance-queues-view']});

  jest.mocked(usePageFilters).mockReturnValue({
    isReady: true,
    desyncedFilters: new Set(),
    pinnedFilters: new Set(),
    shouldPersist: true,
    selection: {
      datetime: {
        period: '10d',
        start: null,
        end: null,
        utc: false,
      },
      environments: [],
      projects: [],
    },
  });

  jest.mocked(useLocation).mockReturnValue({
    pathname: '',
    search: '',
    query: {statsPeriod: '10d', project: '1'},
    hash: '',
    state: undefined,
    action: 'PUSH',
    key: '',
  });

  jest.mocked(useOrganization).mockReturnValue(organization);

  jest.mocked(useProjects).mockReturnValue({
    projects: [],
    onSearch: jest.fn(),
    placeholders: [],
    fetching: false,
    hasMore: null,
    fetchError: null,
    initiallyLoaded: false,
  });

  let eventsMock, eventsStatsMock;

  beforeEach(() => {
    eventsMock = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/events/`,
      method: 'GET',
      body: {data: []},
    });

    eventsStatsMock = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/events-stats/`,
      method: 'GET',
      body: {data: []},
    });
  });

  afterEach(() => {
    MockApiClient.clearMockResponses();
  });

  it('renders', async () => {
    render(<QueuesLandingPage />);
    await screen.findByRole('table', {name: 'Queues'});
    await waitForElementToBeRemoved(() => screen.queryAllByTestId('loading-indicator'));
    screen.getByPlaceholderText('Search for events, users, tags, and more');
    screen.getByText('Avg Latency');
    screen.getByText('Published vs Processed');
    expect(eventsStatsMock).toHaveBeenCalled();
    expect(eventsMock).toHaveBeenCalled();
  });

  it('does not query for avg(messaging.message.receive.latency) when not available', async () => {
    MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/events/`,
      method: 'GET',
      body: {error: {message: 'Invalid query'}},
      match: [
        MockApiClient.matchQuery({
          referrer: 'api.performance.queues',
        }),
      ],
      statusCode: 400,
    });
    render(<QueuesLandingPage />);
    await screen.findByRole('table', {name: 'Queues'});
    await waitForElementToBeRemoved(() => screen.queryAllByTestId('loading-indicator'));
    expect(eventsStatsMock).toHaveBeenCalled();
    expect(eventsMock).toHaveBeenCalledTimes(1);
    expect(eventsMock).toHaveBeenCalledWith(
      `/organizations/${organization.slug}/events/`,
      expect.objectContaining({
        method: 'GET',
        query: expect.objectContaining({
          dataset: 'spansMetrics',
          environment: [],
          field: [
            'messaging.destination.name',
            'count()',
            'count_op(queue.publish)',
            'count_op(queue.process)',
            'sum(span.duration)',
            'avg(span.duration)',
            'avg_if(span.duration,span.op,queue.publish)',
            'avg_if(span.duration,span.op,queue.process)',
          ],
          query: 'span.op:[queue.process,queue.publish]',
          statsPeriod: '10d',
        }),
      })
    );
  });
});
