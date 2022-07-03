import React, { useState, useEffect } from 'react';

import { Provider, connect } from 'react-redux';
import { changeDateFormat } from '../../Analytics';
import AnalyticsGraph from '../../Analytics/AnalyticsGraph';
import AssetsRatingTable from './AssetsRatingTable';

import * as Api from '../../../api/team';
import store from '../../../store';
import localization from '../../../shared/strings';

const AnalyticsTab = (props) => {
  const [supportedOnThisPlan, setSupportedOnThisPlan] = useState(false);

  const [assetsInTheLibrary, setAssetsInTheLibrary] = useState({
    data: [
      {
        id: 'images', name: 'Images', label: '', value: 0,
      },
      {
        id: 'video', name: 'Video', label: '', value: 0,
      },
      {
        id: 'audio', name: 'Audio', label: '', value: 0,
      },
      {
        id: 'text', name: 'Text documents', label: '', value: 0,
      },
      {
        id: 'pdf', name: 'PDF documents', label: '', value: 0,
      },
      {
        id: 'sketch', name: 'Sketch files', label: '', value: 0,
      },
      {
        id: 'raw', name: 'DSLR RAW photos', label: '', value: 0,
      },
      {
        id: 'photoshop', name: 'Photoshop documents', label: '', value: 0,
      },
      {
        id: '3d', name: '3D models', label: '', value: 0,
      },
    ],
    total: 0,
  });
  const [assetsInTheLibraryFetching, setAssetsInTheLibraryFetching] = useState(true);
  const [assetsInTheLibraryErr, setAssetsInTheLibraryErr] = useState(false);

  const [assetsUploaded, setAssetsUploaded] = useState({
    data: [],
    total: 0,
  });
  const [assetsUploadedFetching, setAssetsUploadedFetching] = useState(true);

  const [assetsDownloadedByTeam, setAssetsDownloadedByTeam] = useState([]);
  const [assetsDownloadedByTeamFetching, setAssetsDownloadedByTeamFetching] = useState(true);

  const [websitesDownloadedByWebUsersData, setWebsitesDownloadedByWebUsersData] = useState([]);
  const [websitesDownloadedByWebUsersDataFetching, setWebsitesDownloadedByWebUsersDataFetching] = useState(true);

  const [assetsRating, setAssetsRating] = useState([]);
  const [assetsRatingFetching, setAssetsRatingFetching] = useState(true);

  const [metadataChangedData, setAssetsMetadataChangedData] = useState([]);
  const [metadataChangedDataFetching, setMetadataChangedDataFetching] = useState(true);

  const [assetsCommentedData, setAssetsCommentedData] = useState([]);
  const [assetsCommentedDataFetching, setAssetsCommentedDataFetching] = useState(true);

  const [webSites, setWebSites] = useState({
    data: [],
    total: 0,
  });
  const [webSitesFetching, setWebSitesFetching] = useState(true);

  const fetchStorageStats = async () => {
    try {
      const res = await Api.fetchStorageStats();
      const { assets } = res;
      const { total } = assets;
      const { data } = assetsInTheLibrary;
      const updatedData = data.map((item) => {
        const { id } = item;
        const value = assets[id];

        if (value) {
          return { ...item, value };
        }
        return item;
      });

      setAssetsInTheLibraryFetching(false);
      setAssetsInTheLibrary({
        data: updatedData,
        total,
      });
    } catch (err) {
      console.error(err);
      setAssetsInTheLibraryErr(true);
    }
  };

  const fetchAssetsTotal = async () => {
    try {
      const assetsUploadedData = await Api.fetchAssetsTotal();
      setAssetsUploadedFetching(false);
      setAssetsUploaded(changeDateFormat(assetsUploadedData, 'lineChart'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssetsDownloadsByTeam = async () => {
    try {
      const assetsDownloadedByTeamData = await Api.fetchAssetsStatsByEvent(['assets.downloaded']);
      setAssetsDownloadedByTeamFetching(false);
      setAssetsDownloadedByTeam(changeDateFormat(assetsDownloadedByTeamData, 'barChart'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssetsDownloadsFromWeb = async () => {
    try {
      const websitesSummDownloadedByWebUsersData = await Api.fetchAssetsStatsByEvent(['assets.downloaded'], true);
      setWebsitesDownloadedByWebUsersDataFetching(false);
      setWebsitesDownloadedByWebUsersData(changeDateFormat(websitesSummDownloadedByWebUsersData, 'barChart'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTop10DownloadedAssets = async () => {
    try {
      const { feed } = await Api.fetchAssetsTopStatsByEvents(['assets.downloaded']);
      setAssetsRatingFetching(false);
      setAssetsRating(feed);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssetsWithMetadataChanged = async () => {
    try {
      const assetsMetadataChangedData = await Api.fetchAssetsStatsByEvent([
        'assets.flag.changed',
        'assets.rating.changed',
        'assets.color.changed',
        'assets.keyword_attached',
        'assets.metadata.changed',
        'assets.keyword_detached',
      ]);
      setMetadataChangedDataFetching(false);
      setAssetsMetadataChangedData(changeDateFormat(assetsMetadataChangedData, 'barChart'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssetsWithCommentAdded = async () => {
    try {
      const assetsCommentedData = await Api.fetchAssetsStatsByEvent(['asset.comment.added']);
      setAssetsCommentedDataFetching(false);
      setAssetsCommentedData(changeDateFormat(assetsCommentedData, 'barChart'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWebsitesTotal = async () => {
    try {
      const websitesData = await Api.fetchWebsitesTotal();
      setWebSitesFetching(false);
      setWebSites(changeDateFormat(websitesData, 'lineChart'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (props.subscriptionFeatures.libraryAnalytics) {
      setSupportedOnThisPlan(true);

      props.manageStorage && fetchStorageStats();
      fetchAssetsTotal();
      fetchAssetsDownloadsByTeam();
      fetchAssetsDownloadsFromWeb();
      fetchTop10DownloadedAssets();
      fetchAssetsWithMetadataChanged();
      fetchAssetsWithCommentAdded();
      fetchWebsitesTotal();
    }
  }, []);

  return (
    <div className="pageTabsAnalytics">
      {props.manageStorage ? (
        <AnalyticsGraph
          type="pieGraph"
          fetching={assetsInTheLibraryFetching}
          data={assetsInTheLibrary.data}
          total={assetsInTheLibrary.total}
          title={localization.ANALYTICS.titleAssetsInTheLibrary}
          isSupported={supportedOnThisPlan}
        />
      ) : null}
      <AnalyticsGraph
        type="linearGraph"
        fetching={assetsUploadedFetching}
        data={assetsUploaded.data}
        total={assetsUploaded.total}
        isSupported={supportedOnThisPlan}
        title={`${localization.ANALYTICS.titleAssetsUploaded}`}
        emptyDataTitle="No assets in the library"
      />
      <AnalyticsGraph
        type="barGraph"
        fetching={assetsDownloadedByTeamFetching}
        data={assetsDownloadedByTeam}
        isSupported={supportedOnThisPlan}
        title={`${localization.ANALYTICS.titleAssetsDownloadedByTeam}`}
      />
      <AnalyticsGraph
        type="barGraph"
        fetching={websitesDownloadedByWebUsersDataFetching}
        data={websitesDownloadedByWebUsersData}
        isSupported={supportedOnThisPlan}
        title={`${localization.ANALYTICS.titleWebsitesDownloadedByWebUsersData}`}
      />
      <AssetsRatingTable fetching={assetsRatingFetching} data={assetsRating} isSupported={supportedOnThisPlan} />
      <AnalyticsGraph
        type="barGraph"
        fetching={metadataChangedDataFetching}
        data={metadataChangedData}
        isSupported={supportedOnThisPlan}
        title={`${localization.ANALYTICS.titleMetadataChanged}`}
      />
      <AnalyticsGraph
        type="barGraph"
        fetching={assetsCommentedDataFetching}
        data={assetsCommentedData}
        isSupported={supportedOnThisPlan}
        title={` ${localization.ANALYTICS.titleAssetsCommented}`}
      />
      <AnalyticsGraph
        type="linearGraph"
        fetching={webSitesFetching}
        data={webSites.data}
        total={webSites.total}
        isSupported={supportedOnThisPlan}
        title={`${localization.ANALYTICS.titleActiveWebSites}`}
        emptyDataTitle="No active websites"
      />
    </div>
  );
};

const ConnectedAnalytics = connect((store) => ({
  subscriptionFeatures: store.user.subscriptionFeatures,
  manageStorage: store.user.role.permissions.manageStorage,
}))(AnalyticsTab);

export default (props) => (
  <Provider store={store}>
    <ConnectedAnalytics {...props} />
  </Provider>
);
