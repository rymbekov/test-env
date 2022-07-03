import React, { useState, useEffect } from 'react';
import { useMount } from 'react-use';
import { IconButton } from '@picsio/ui';
import { Close } from '@picsio/ui/dist/icons';
import Logger from '../../../services/Logger';
import * as TeamApi from '../../../api/team';
import { isHaveTeammatePermission } from '../../../store/helpers/user';
import { navigate } from '../../../helpers/history';
import SlackIcon from './SlackIcon.svg';
import './connectSlack.scss';

const ConnectSlack = () => {
  const [connected, setConnected] = useState(null);
  const [closed, setClosed] = useState(false);
  const manageIntegrations = isHaveTeammatePermission('manageIntegrations');

  useMount(() => {
    const connectSlackClosed = JSON.parse(localStorage.getItem('picsio.connectSlackClosed')) || false;
    setClosed(connectSlackClosed);
    if (!connectSlackClosed) {
      Logger.log('UI', 'ConnectSlackOpened');
    }
  });

  useEffect(() => {
    const slackConnection = JSON.parse(sessionStorage.getItem('picsio.slackConnection'));

    const checkSlack = async () => {
      try {
        const res = await TeamApi.getSlackbotsStatus();
        const slackConnectionStatus = res.status === 'connected';
        sessionStorage.setItem('picsio.slackConnection', slackConnectionStatus);
        setConnected(slackConnectionStatus);
      } catch (err) {
        Logger.error(new Error('Can not check slackbot status'), { error: err }, [
          'CheckSlackBotStatusFailed',
          (err && err.message) || 'NoMessage',
        ]);
      }
    };

    if (manageIntegrations && slackConnection === null) {
      checkSlack();
    }

    if (manageIntegrations && slackConnection !== null) {
      setConnected(slackConnection);
    }
  }, [manageIntegrations]);

  const handleClick = () => {
    Logger.log('User', 'ConnectSlackClick');
    navigate('/teammates?tab=integrations');
  };

  const handleClose = (e) => {
    e.stopPropagation();
    Logger.log('User', 'ConnectSlackClose');
    localStorage.setItem('picsio.connectSlackClosed', true);
    setClosed(true);
  };

  return (
    <Choose>
      <When condition={!closed && manageIntegrations && connected === false}>
        <div
          className="connectSlack"
          role="button"
          onClick={handleClick}
          onKeyPress={handleClick}
          tabIndex={0}
        >
          Get comments in
          <SlackIcon className="connectSlack-logo" />
          <IconButton
            size="md"
            color="inherit"
            onClick={handleClose}
          >
            <Close />
          </IconButton>
        </div>
      </When>
      <Otherwise>{null}</Otherwise>
    </Choose>
  );
};

export default ConnectSlack;
