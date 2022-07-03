// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { App } from '@capacitor/app';
import Logger from '../services/Logger';

// https://capacitorjs.com/docs/guides/deep-links
const AppUrlListener = () => {
  const history = useHistory();

  useEffect(() => {
    App.addListener('appUrlOpen', (event) => {
      const slug = event.url.split('.io').pop();
      Logger.log('User', 'AppUrlOpen', { slug });
      if (slug) {
        history.push(slug);
      }
    });
  }, []);

  return null;
};

export default AppUrlListener;
