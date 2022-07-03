import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import localization from '../../shared/strings';
import * as Api from '../../api/team';

import { changeDateFormat } from './helpers/changeDateFormat';
import AnalyticsGraph from './AnalyticsGraph';

const AssetAnalyticsScreen = props => {
  const isSupported = props.subscriptionFeatures.assetAnalytics;

  const [assetDownloadedByTeam, setAssetDownloadedByTeam] = useState([]);
  const [assetDownloadedByTeamFetching, setAssetDownloadedByTeamFetching] = useState(false);

  const [assetDownloadedByWebUsers, setAssetDownloadedByWebUsers] = useState([]);
  const [assetDownloadedByWebUsersFetching, setAssetDownloadedByWebUsersFetching] = useState(false);

  const [assetChanged, setAssetChanged] = useState([]);
  const [assetChangedFetching, setAssetChangedFetching] = useState(false);

  const [metadataChangedData, setMetadataChangedData] = useState([]);
  const [metadataChangedDataFetching, setMetadataChangedDataFetching] = useState(false);

  const fetchDownloadedByTeamData = async () => {
    try {
      setAssetDownloadedByTeamFetching(true);
      const assetDownloadedByTeamData = await Api.fetchAssetStatsByEvent(props.asset._id, ['assets.downloaded']);
      setAssetDownloadedByTeam(changeDateFormat(assetDownloadedByTeamData, 'barChart'));
    } catch (err) {
      console.error(err);
    } finally {
      setAssetDownloadedByTeamFetching(false);
    }
  };

  const fetchDownloadedByWebData = async () => {
    try {
      setAssetDownloadedByWebUsersFetching(true);
      const assetDownloadedByWebUsersData = await Api.fetchAssetStatsByEvent(
        props.asset._id,
        ['assets.downloaded'],
        false
      );
      setAssetDownloadedByWebUsers(changeDateFormat(assetDownloadedByWebUsersData, 'barChart'));
    } catch (err) {
      console.error(err);
    } finally {
      setAssetDownloadedByWebUsersFetching(false);
    }
  };

  const fetchChangedData = async () => {
    try {
      setAssetChangedFetching(true);
      const assetChangedData = await Api.fetchAssetStatsByEvent(props.asset._id, ['asset.revision.created']);
      setAssetChanged(changeDateFormat(assetChangedData, 'barChart'));
    } catch (err) {
      console.error(err);
    } finally {
      setAssetChangedFetching(false);
    }
  };

  const fetchAssetsWithMetadataChanged = async () => {
    try {
      setMetadataChangedDataFetching(true);
      const assetMetadataChangedData = await Api.fetchAssetStatsByEvent(props.asset._id, [
        'assets.flag.changed',
        'assets.rating.changed',
        'assets.color.changed',
        'assets.keyword_attached',
        'assets.metadata.changed',
        'assets.keyword_detached',
      ]);
      setMetadataChangedData(changeDateFormat(assetMetadataChangedData, 'barChart'));
    } catch (err) {
      console.error(err);
    } finally {
      setMetadataChangedDataFetching(false);
    }
  };

  useEffect(() => {
    if (props.subscriptionFeatures.assetAnalytics) {
      fetchDownloadedByTeamData();
      fetchDownloadedByWebData();
      fetchChangedData();
      fetchAssetsWithMetadataChanged();
    }
  }, []);

  return (
    <div className="assetAnalytics">
      <AnalyticsGraph
        type="barGraph"
        fetching={assetDownloadedByTeamFetching}
        data={assetDownloadedByTeam}
        isSupported={isSupported}
        title={localization.ANALYTICS.titleAssetDownloadedByTeam}
      />
      <AnalyticsGraph
        type="barGraph"
        fetching={assetDownloadedByWebUsersFetching}
        data={assetDownloadedByWebUsers}
        isSupported={isSupported}
        title={localization.ANALYTICS.titleAssetDownloadedByWebUsers}
      />
      <AnalyticsGraph
        type="barGraph"
        fetching={assetChangedFetching}
        data={assetChanged}
        isSupported={isSupported}
        title={localization.ANALYTICS.titleAssetChanged}
      />
      <AnalyticsGraph
        type="barGraph"
        fetching={metadataChangedDataFetching}
        data={metadataChangedData}
        isSupported={isSupported}
        title={localization.ANALYTICS.titleMetadataChangedData}
      />
    </div>
  );
};

const ConnectedAnalytics = connect(store => {
  return {
    subscriptionFeatures: store.user.subscriptionFeatures,
  };
})(AssetAnalyticsScreen);

export default ConnectedAnalytics;
