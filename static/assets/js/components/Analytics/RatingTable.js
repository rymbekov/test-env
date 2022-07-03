import React, { memo } from 'react';
import PropTypes from 'prop-types';

import GraphTitle from './AnalyticsGraph/GraphTitle';
import Tag from '../Tag';
import TableGraphSkeleton from './AnalyticsGraph/TableGraphSkeleton';

const RatingTable = props => {
	const { fetching, data, isSupported } = props;
	const showTable = isSupported && !fetching && data.length;

	return (
		<div className="graphWrapper ratingTableGraph">
			<GraphTitle title="Top active users" isSupported={isSupported} />
			<div className="graphContent">
				{showTable ? (
					<div className="tableWrapper">
						<div className="tableTitle">
							<div className="tableTitleRightSide">
								<span>Uploads</span>
								<span>Comments</span>
								<span>Downloads</span>
							</div>
						</div>
						<div className="tableRows">
							{data.map(item => {
								const {
									_id,
									userName,
									avatar,
									asset_created,
									asset_comment_added,
									assets_downloaded,
									progressValue,
								} = item;

								return (
									<div key={_id} className="tableRowWrapper">
										<div className="tableRow">
											<Tag type="user" text={userName} avatar={avatar && avatar} />
											<div className="tableRowRightSide">
												<span>{asset_created}</span>
												<span>{asset_comment_added}</span>
												<span>{assets_downloaded}</span>
											</div>
										</div>
										<div className="rowProgressLine" style={{ width: `${progressValue}%` }}></div>
									</div>
								);
							})}
						</div>
					</div>
				) : (
					<TableGraphSkeleton fetching={fetching} />
				)}
			</div>
		</div>
	);
};

RatingTable.defaultProps = {
	data: [],
};
RatingTable.propTypes = {
	fetching: PropTypes.bool.isRequired,
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	isSupported: PropTypes.bool.isRequired,
};

export default memo(RatingTable);
