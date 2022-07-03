import React from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';

const TableGraphSkeleton = ({ fetching, count }) => (
	<div className="graphSkeleton tableGraphSkeleton">
		{Array.from({ length: count }, (i, index) => index).map(i => (
			<div key={i} className="graphSkeletonLine">
				<div>{fetching && <Skeleton />}</div>
			</div>
		))}
	</div>
);

TableGraphSkeleton.defaultProps = {
	count: 10,
};
TableGraphSkeleton.propTypes = {
	count: PropTypes.number,
};

export default TableGraphSkeleton;
