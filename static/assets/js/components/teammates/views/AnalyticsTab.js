import React from 'react';
import Skeleton from 'react-loading-skeleton';
import WithSkeletonTheme from '../../WithSkeletonTheme';
import UpgradePlan from '../../UpgradePlan';

const teammateAnalyticsFields = {
  visitedAt: {
    title: 'Last Time logged in',
    defaultValue: 'n/a',
  },
  asset_created: {
    title: 'Uploaded assets',
    defaultValue: 0,
  },
  asset_comment_added: {
    title: 'Commented assets',
    defaultValue: 0,
  },
  assets_assigned: {
    title: 'Assigned users',
    defaultValue: 0,
  },
  asset_revision_created: {
    title: 'Changed assets',
    defaultValue: 0,
  },
};

const teammateAnalyticsKeys = Object.keys(teammateAnalyticsFields);

const AnalyticsTab = ({
  userMetricFetching, user, userMetric, isShowTeammateAnalytics,
}) => (
  <div className="tabsContentActivity">
    <div className="tabTitle">Activity {!isShowTeammateAnalytics && <UpgradePlan />}</div>
    {!userMetricFetching ? (
      <ul className="tabList">
        {teammateAnalyticsKeys.map((key) => {
          const analyticField = teammateAnalyticsFields[key];
          const { title, defaultValue } = analyticField;
          const analyticFieldValue = user[key] || userMetric[key];
          const stringValue = `: ${
            analyticFieldValue !== null || analyticFieldValue !== undefined ? analyticFieldValue : defaultValue
          }`;

          return (
            <li key={key}>
              {title}
              {isShowTeammateAnalytics && stringValue}
            </li>
          );
        })}
      </ul>
    ) : (
      <div className="flexColumn">
        <WithSkeletonTheme>
          <Skeleton width={200} height={18} count={teammateAnalyticsKeys.length} />
        </WithSkeletonTheme>
      </div>
    )}
  </div>
);

export default AnalyticsTab;
