import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import ua from '../../ua';
import Icon from '../Icon';
import Logger from '../../services/Logger';
import { LocalStorage } from '../../shared/utils';

import './MobileAppBanner.scss';

const getBannerInfo = () => LocalStorage.get('picsio.mobileAppBanner') || {};
const setBannerInfo = (info) => {
  LocalStorage.set('picsio.mobileAppBanner', info);
};

const isShow = (info) => {
  const { dismiss, date, openedMarket } = info;

  if (ua.isMobileApp()) return false;

  if (!ua.isMobileApp() && !ua.browser.isNotDesktop()) {
    return false;
  }

  if (!openedMarket) {
    if (!dismiss) {
      return true;
    }
    if (dismiss < 2) {
      const lastClick = dayjs(date);
      const now = dayjs();
      const diff = lastClick.diff(now, 'day');

      if (diff >= 5) {
        return true;
      }
      return false;
    }
    return true;
  }
  return false;
};

const MobileAppBanner = () => {
  const [open, setOpen] = useState(false);
  const info = getBannerInfo();
  const { dismiss } = info;

  useEffect(() => {
    const show = isShow(info);

    if (show) {
      Logger.log('User', 'MobileAppBannerShow');
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setOpen(false);
  };

  const handleClose = (event) => {
    event.stopPropagation();
    Logger.log('User', 'MobileAppBannerCloseClicked');
    setBannerInfo({ dismiss: +dismiss || 0 + 1, date: new Date() });
    close();
  };

  const handleBannerClick = () => {
    Logger.log('User', 'MobileAppBannerClicked');
    if (ua.os.family === 'iOS') {
      window.open('https://apps.apple.com/us/app/pics-io/id1541131581', '_blank');
    } else {
      window.open('https://play.google.com/store/apps/details?id=io.pics.app', '_blank');
    }
    setBannerInfo({ openedMarket: true, date: new Date() });
    close();
  };

  if (!open) return null;

  return (
    <div className="MobileAppBanner" onClick={handleBannerClick} role="banner">
      <div className="MobileAppBannerClose">
        <Icon name="close" onClick={handleClose} />
      </div>
      <div className="MobileAppBannerContent">
        <div className="MobileAppBannerLogoWrapper">
          <div className="MobileAppBannerLogo">
            <Icon name="logoPicsio" />
          </div>
        </div>
        <div className="MobileAppBannerText">Give Pics.io app a try</div>
      </div>
    </div>
  );
};

export default MobileAppBanner;
