import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';

import localization from '../../../shared/strings';

const getMessage = (fetching, isSupported) => {
  if (fetching) {
    return null;
  }
	if (!isSupported) {
		return localization.ANALYTICS.placeholder.noSupported;
	}
	return localization.ANALYTICS.placeholder.noAvailable;
};

const LinearGraphSkeleton = props => {
	const { fetching, type, isSupported } = props;
	const message = getMessage(fetching, isSupported);

	return (
		<div className={clsx('graphSkeleton', 'linearGraphSkeleton', type, {
      loading: fetching,
    })}>
			<div className="graphSkeletonMessage">
				<span>{message}</span>
			</div>
			<div className="graphSkeletonLine" />
			<div className="graphSkeletonLine" />
			<div className="graphSkeletonLine" />
			<div className="graphSkeletonLine" />
			<div className="graphSkeletonLine" />
			<div className="graphSkeletonLine" />
			<div className="graphSkeletonLine" />
			<div className="graphSkeletonLine" />
			<div className="graphSkeletonLine" />
			<div className="graphSkeletonLine" />
		</div>
	);
};

LinearGraphSkeleton.defaultProps = {
	fetching: false,
	isSupported: false,
};
LinearGraphSkeleton.propTypes = {
	fetching: PropTypes.bool,
  type: PropTypes.oneOf(['linearGraph', 'barGraph', 'pieGraph']).isRequired,
	isSupported: PropTypes.bool,
};

export default LinearGraphSkeleton;
