import GenericDiscoverQuery, {
  DiscoverQueryProps,
  GenericChildrenProps,
} from 'sentry/utils/discover/genericDiscoverQuery';
import {DataFilter, HistogramData} from 'sentry/utils/performance/histogram/types';

import {SpanSlug} from '../suspectSpans/types';

type HistogramProps = {
  numBuckets: number;
  span: SpanSlug;
  dataFilter?: DataFilter;
  didReceiveMultiAxis?: (axisCounts: Record<string, number>) => void;
  max?: string;
  min?: string;
  precision?: number;
};

type RequestProps = DiscoverQueryProps & HistogramProps;

export type HistogramQueryChildrenProps = Omit<
  GenericChildrenProps<HistogramProps>,
  'tableData'
> & {
  histogram: HistogramData | null;
};

type Props = RequestProps & {
  children: (props: HistogramQueryChildrenProps) => React.ReactNode;
};

function getHistogramRequestPayload(props: RequestProps) {
  const {span, numBuckets, min, max, precision, dataFilter, eventView, location} = props;
  const baseApiPayload = {
    span: `${span.op}:${span.group}`,
    numBuckets,
    min,
    max,
    precision,
    dataFilter,
  };

  const {
    sort: _s,
    per_page: _p,
    cursor: _c,
    ...additionalApiPayload
  } = eventView.getEventsAPIPayload(location);

  return {...baseApiPayload, ...additionalApiPayload};
}

function SpanHistogramQuery(props: Props) {
  const {children: _, ...propsWithoutChildren} = props;
  return (
    <GenericDiscoverQuery<HistogramData, HistogramProps>
      route="events-spans-histogram"
      getRequestPayload={getHistogramRequestPayload}
      {...propsWithoutChildren}
    >
      {({tableData, ...rest}) => {
        return props.children({histogram: tableData, ...rest});
      }}
    </GenericDiscoverQuery>
  );
}

export default SpanHistogramQuery;
