import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import * as Api from '../../../api/team';
import localization from '../../../shared/strings';

import AnalyticsGraph from '../../Analytics/AnalyticsGraph';
import { changeDateFormat } from '../../Analytics';

const Analytics = (props) => {
  const isSupported = props.subscriptionFeatures.websitesAnalytics;

  const [websitesSummOfVisitors, setWebsitesSummOfVisitors] = useState([]);
  const [websitesSummOfVisitorsFetching, setWebsitesSummOfVisitorsFetching] = useState(false);

  const [websitesDownloadedByWebUsersData, setWebsitesDownloadedByWebUsersData] = useState([]);
  const [websitesDownloadedByWebUsersDataFetching, setWebsitesDownloadedByWebUsersDataFetching] = useState(false);

  const fetchVisitorsData = async () => {
    try {
      setWebsitesSummOfVisitorsFetching(true);
      const websitesSummOfVisitors = await Api.fetchWebsitesSummOfVisitors('visited', props.collectionId);
      setWebsitesSummOfVisitors(changeDateFormat(websitesSummOfVisitors, 'barChart'));
    } catch (err) {
      console.error(err);
      setWebsitesSummOfVisitors([]);
    } finally {
      setWebsitesSummOfVisitorsFetching(false);
    }
  };

  const fetchDownloadsByWebUsersData = async () => {
    try {
      setWebsitesDownloadedByWebUsersDataFetching(true);
      const websitesSummDownloadedByWebUsersData = await Api.fetchWebsitesSummOfDownloaded(
        'downloaded',
        props.collectionId,
      );
      setWebsitesDownloadedByWebUsersData(changeDateFormat(websitesSummDownloadedByWebUsersData, 'barChart'));
    } catch (err) {
      console.error(err);
      setWebsitesDownloadedByWebUsersData([]);
    } finally {
      setWebsitesDownloadedByWebUsersDataFetching(false);
    }
  };

  useEffect(() => {
    if (props.subscriptionFeatures.websitesAnalytics) {
      fetchVisitorsData();
      fetchDownloadsByWebUsersData();
    }
  }, []);

  return (
    <div className="pageTabsAnalytics">
      <AnalyticsGraph
        type="barGraph"
        fetching={websitesSummOfVisitorsFetching}
        data={websitesSummOfVisitors}
        title={`${localization.ANALYTICS.titleSummOfVisitors}`}
        isSupported={isSupported}
      />
      <AnalyticsGraph
        type="barGraph"
        fetching={websitesDownloadedByWebUsersDataFetching}
        data={websitesDownloadedByWebUsersData}
        title={`${localization.ANALYTICS.titleWebsiteDownloadedByWEbUsers}`}
        isSupported={isSupported}
      />
    </div>
  );
};

const ConnectedAnalytics = connect((store) => ({
  subscriptionFeatures: store.user.subscriptionFeatures,
}))(Analytics);

export default ConnectedAnalytics;
