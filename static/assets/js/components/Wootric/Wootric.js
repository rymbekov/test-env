import React from 'react';
import store from '../../store';
import * as Defaults from './config/defaults';
import './wootric.scss';

class Wootric extends React.Component {
  componentDidMount() {
    const { user } = store.getState();
    const createdAt = Math.round(new Date(user.createdAt).getTime() / 1000);
    const setupScript = document.createElement('script');
    setupScript.type = 'text/javascript';
    setupScript.id = 'wootric-settings';
    setupScript.async = true;
    setupScript.innerHTML = `
      wootric_no_surveyed_cookie = ${Defaults.WOOTRIC_NO_SURVEYED_COOKIE};
      wootric_survey_immediately = ${Defaults.WOOTRIC_SURVEY_IMMEDIATELY};
      window.wootricSettings = {
        email: "${user.email}", // Required to uniquely identify a user. Email is recommended but this can be any unique identifier.
        created_at: ${createdAt}, // The current logged in user's sign-up date as a Unix timestamp.
        account_token: "${Defaults.WOOTRIC_ACCOUNT_TOKEN}"
      };
    `;
    if (document.getElementById('wootric-settings') == null) {
      document.body.appendChild(setupScript);
    }

    // Beacon
    const beacon = document.createElement('script');
    beacon.type = 'text/javascript';
    beacon.id = 'wootric-beacon';
    beacon.async = true;

    beacon.src = 'https://cdn.wootric.com/wootric-sdk.js';
    beacon.onload = function () {
      window.wootric('run');
    };
    if (document.getElementById('wootric-beacon') == null) {
      document.body.appendChild(beacon);
    }
  }

  render() {
    return <div />;
  }
}

export default Wootric;
