import React, { memo } from 'react';
import PropTypes from 'prop-types';

import localization from '../../../shared/strings';
import { GraphTitle, TableGraphSkeleton } from '../../Analytics/AnalyticsGraph';

const AssetsRatingTable = (props) => {
  const { fetching, data, isSupported } = props;
  const showTable = isSupported && !fetching && data.length;

  return (
    <div className="graphWrapper ratingTableGraph">
      <GraphTitle title={localization.ANALYTICS.titleRatingTableGraph} isSupported={isSupported} />
      <div className="graphContent">
        {showTable ? (
          <div className="tableWrapper">
            {data.map((item) => {
              const {
                _id: id, name, count, progressValue,
              } = item;
              const assetName = name || `ID: ${id}`;

              return (
                <div className="tableRowWrapper" key={id}>
                  <div className="tableRowAssets">
                    <span className="assetsName">{assetName}</span>
                    <div className="tableRowRightSide">
                      <span>{count}</span>
                    </div>
                  </div>
                  <div className="rowProgressLine" style={{ width: `${progressValue}%` }} />
                </div>
              );
            })}
          </div>
        ) : (
          <TableGraphSkeleton fetching={fetching} />
        )}
      </div>
    </div>
  );
};

AssetsRatingTable.defaultProps = {
  data: [],
};
AssetsRatingTable.propTypes = {
  fetching: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSupported: PropTypes.bool.isRequired,
};

export default memo(AssetsRatingTable);
