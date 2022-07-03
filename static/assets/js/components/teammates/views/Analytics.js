import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import * as Api from '../../../api/team';
import localization from '../../../shared/strings';

import { RatingTable, changeDateFormat } from '../../Analytics';
import AnalyticsGraph from '../../Analytics/AnalyticsGraph';

const Analytics = (props) => {
  const {
    subscriptionFeatures: { teammateAnalytics },
  } = props;

  const [teammatesFetching, setTeammatesFetching] = useState(false);
  const [teammates, setTeammates] = useState({
    data: [],
    total: 0,
  });
  const [invitedUsers, setInvitedUsers] = useState({
    data: [
      {
        name: 'accepted', id: 'accepted', label: '', value: 0,
      },
      {
        name: 'waiting', id: 'waiting', label: '', value: 0,
      },
    ],
    total: 0,
  });
  const [invitedUsersFetching, setInvitedUsersFetching] = useState(false);

  const [userLoginStats, setUserLoginStats] = useState([]);
  const [userLoginStatsFetching, setUserLoginStatsFetching] = useState(false);

  const [usersRating, setUsersRating] = useState([]);
  const [usersRatingFetching, setUsersRatingFetching] = useState(false);

  const prepareRating = (usersData) => {
    const { teammates } = props;

    if (usersData.feed.length !== 0) {
      usersData.feed.map((usersIndex) => {
        teammates.map((teammatesIndex) => {
          if (teammatesIndex._id == usersIndex._id) {
            usersIndex.userName = teammatesIndex.displayName;
            usersIndex.avatar = teammatesIndex.avatar;
          }
        });
      });
      return usersData.feed;
    }
  };

  const fetchTeammatesData = async () => {
    try {
      setTeammatesFetching(true);
      const teammatesData = await Api.fetchTeammatesTotal();
      setTeammates(changeDateFormat(teammatesData, 'lineChart'));
    } catch (err) {
      console.error(err);
    } finally {
      setTeammatesFetching(false);
    }
  };

  const fetchTeammatesInvitedData = async () => {
    try {
      setInvitedUsersFetching(true);
      const { feed } = await Api.fetchTeammatesInvitedStats();
      const { data } = invitedUsers;
      const updatedData = data.map((item) => {
        const { id } = item;
        const value = feed[id];

        if (value) {
          return { ...item, value };
        }
        return item;
      });
      const total = updatedData.reduce((acc, { value }) => acc + value, 0);
      setInvitedUsers({ data: updatedData, total });
    } catch (err) {
      console.error(err);
    } finally {
      setInvitedUsersFetching(false);
    }
  };

  const fetchLoginsData = async () => {
    try {
      setUserLoginStatsFetching(true);
      const userLoginStats = await Api.fetchUserLoginStats();
      setUserLoginStats(changeDateFormat(userLoginStats, 'barChart'));
    } catch (err) {
      console.error(err);
    } finally {
      setUserLoginStatsFetching(false);
    }
  };

  const fetchRatingData = async () => {
    try {
      setUsersRatingFetching(true);
      const teammatesStatsRating = await Api.fetchTeammatesStats();
      setUsersRating(prepareRating(teammatesStatsRating));
    } catch (err) {
      console.error(err);
    } finally {
      setUsersRatingFetching(false);
    }
  };

  useEffect(() => {
    if (teammateAnalytics) {
      fetchTeammatesData();
      fetchTeammatesInvitedData();
      fetchLoginsData();
      fetchRatingData();
    }
  }, []);

  return (
    <div className="pageTabsAnalytics">
      <AnalyticsGraph
        type="linearGraph"
        fetching={teammatesFetching}
        data={teammates.data}
        isSupported={teammateAnalytics}
        title={localization.ANALYTICS.titleTeammates}
      />
      <AnalyticsGraph
        type="pieGraph"
        fetching={invitedUsersFetching}
        data={invitedUsers.data}
        total={invitedUsers.total}
        title="users invited"
        isSupported={teammateAnalytics}
      />
      <AnalyticsGraph
        type="barGraph"
        fetching={userLoginStatsFetching}
        data={userLoginStats}
        isSupported={teammateAnalytics}
        title={localization.ANALYTICS.titleUserLoginStats}
      />
      <RatingTable fetching={usersRatingFetching} data={usersRating} isSupported={teammateAnalytics} />
    </div>
  );
};

const ConnectedAnalytics = connect((store) => ({
  subscriptionFeatures: store.user.subscriptionFeatures,
  teammates: store.teammates.items,
}))(Analytics);

export default ConnectedAnalytics;
