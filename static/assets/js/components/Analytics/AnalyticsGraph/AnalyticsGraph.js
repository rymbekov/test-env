import React, { memo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';

import GraphTitle from './GraphTitle';

import LinearGraphSkeleton from './LinearGraphSkeleton';
import LinearGraph from './LinearGraph';
import BarGraph from './BarGraph';
import PieGraph from './PieGraph';

const components = {
  linearGraph: {
    Skeleton: LinearGraphSkeleton,
    Graph: LinearGraph,
  },
  barGraph: {
    Skeleton: LinearGraphSkeleton,
    Graph: BarGraph,
  },
  pieGraph: {
    Skeleton: null,
    Graph: PieGraph,
  },
};

const getTitle = (title, total) => {
  if (total === null) {
    return title;
  }
  return `${total} ${title}`;
};

const AnalyticsGraph = props => {
  const { fetching, data, title, emptyDataTitle, subtitle, type, isSupported, total } = props;
  const isEmpty = !data.length;
  const showEmptyDataTitle = !fetching && isEmpty && emptyDataTitle;
  const showSkeleton = !isSupported || fetching || isEmpty;
  const { Skeleton, Graph } = components[type];
  const currentTitle = showEmptyDataTitle ? emptyDataTitle : getTitle(title, total);

  return (
    <div className={clsx('analyticsGraph graphWrapper', type)}>
      <GraphTitle title={currentTitle} isSupported={isSupported} />
      <div className="graphContent">
        <Choose>
          <When condition={Skeleton && showSkeleton}>
            <Skeleton fetching={fetching} type={type} isSupported={isSupported} />
          </When>
          <Otherwise>
            <Graph fetching={fetching} data={data} total={total} />
          </Otherwise>
        </Choose>
      </div>
      <If condition={subtitle}>
        <div className="graphSubTitle">
          <span>{subtitle}</span>
        </div>
      </If>
    </div>
  );
};

AnalyticsGraph.defaultProps = {
  data: [],
  total: null,
  subtitle: '',
  emptyDataTitle: '',
};
AnalyticsGraph.propTypes = {
  fetching: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
  emptyDataTitle: PropTypes.string,
  subtitle: PropTypes.string,
  type: PropTypes.oneOf(['linearGraph', 'barGraph', 'pieGraph']).isRequired,
  isSupported: PropTypes.bool.isRequired,
  total: PropTypes.number,
};

export default memo(AnalyticsGraph);
