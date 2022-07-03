import React from 'react';
import PropTypes from 'prop-types';
import UpgradePlan from '../../UpgradePlan';

const GraphTitle = ({ title, isSupported }) => (
	<div className="graphTitle">
		<span>{title}</span>
		{!isSupported && <UpgradePlan />}
	</div>
);

GraphTitle.propTypes = {
	title: PropTypes.string.isRequired,
	isSupported: PropTypes.bool.isRequired,
};

export default GraphTitle;
