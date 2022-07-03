import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import {
  Close,
} from '@picsio/ui/dist/icons';
import { IconButton } from '@picsio/ui';
import Logger from '../../services/Logger';

import ua from '../../ua';

import localization from '../../shared/strings';
import Icon from '../Icon';
import Group from './Group';
import HelpButton from './HelpButton';
import Button from './Button';
import Logo from './Logo';

import Tooltip from '../Tooltip';

const ToolbarScreenTop = (props) => {
  const {
    title, unauthorized, helpLink, extra, onClose,
  } = props;

  useEffect(() => {
    /**
     * Listen to press Esc
     * @param {KeyboardEvent} event
     */
    const closeListener = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };

    document.addEventListener('keydown', closeListener);
    window.dispatchEvent(new Event('screen:opened'));

    return () => {
      document.removeEventListener('keydown', closeListener);
      window.dispatchEvent(new Event('screen:closed'));
    };
  }, []);

  const handleLogoClick = () => {
    Logger.log('User', 'LogoClicked');
    onClose();
  };

  return (
    <div className="toolbar toolbarCatalogTop toolbarScreenTop">
      <Group>
        <Choose>
          <When condition={!unauthorized && (ua.isMobileApp() || ua.browser.isNotDesktop())}>
            <Button id="button-backToCatalog" icon="regularPrevArrow" onClick={onClose} />
          </When>
          <Otherwise>
            <Logo
              handleLogoClick={unauthorized ? () => {} : () => handleLogoClick()}
              additionalClass={cn('logoPicsio', { disabled: unauthorized })}
            />
          </Otherwise>
        </Choose>
      </Group>
      <Group additionalClass="assetNameWrapper breadCrumbs">
        <ul>
          {title.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Group>
      <Group>
        {extra}
        {helpLink && <HelpButton icon="question" tooltipPosition="bottom" component={helpLink} />}
        <Choose>
          <When condition={unauthorized}>
            <span className="logoutLink" onClick={app.logout}>
              <Icon name="logout" />
              {localization.BILLING.logoutText}
            </span>
          </When>
          <When condition={!(ua.isMobileApp() || ua.browser.isNotDesktop())}>
            <Tooltip content={localization.TOOLBARS.titleClose} placement="bottom">
              <IconButton
                id="button-screenClose"
                className="toolbarButton"
                onClick={onClose}
                size="xxl"
              >
                <Close />
              </IconButton>
            </Tooltip>
          </When>
        </Choose>
      </Group>
    </div>
  );
};

ToolbarScreenTop.defaultProps = {
  title: [],
  unauthorized: false,
  helpLink: '',
  extra: null,
};

ToolbarScreenTop.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.arrayOf(PropTypes.string),
  unauthorized: PropTypes.bool,
  helpLink: PropTypes.string,
  extra: PropTypes.node,
};

export default memo(ToolbarScreenTop);
