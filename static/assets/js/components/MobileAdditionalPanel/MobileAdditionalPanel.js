import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';
import ErrorBoundary from '../ErrorBoundary';
import { setMobileAdditionalScreenPanel, closeImport } from '../../store/actions/main';
import Search from '../Search';
import Notifications from '../Notifications';
import SettingsMenu from '../toolbars/SettingsMenu';
import Swipeable from '../Swipeable';
import './MobileAdditionalPanel.scss';

export default function MobileAdditionalPanel(props) {
  const { panel } = props;
  const dispatch = useDispatch();
  const {
    items, notificationsUnreadCount, isLoaded, isInprogress,
  } = useSelector(
    (state) => state.notifications,
  );
  const { importOpened } = useSelector((state) => state.main);

  const handleSwipeRight = (eventData) => {
    const { absX, dir } = eventData;
    if (absX > 70 && dir === 'Right') {
      if (importOpened) dispatch(closeImport());
      dispatch(setMobileAdditionalScreenPanel('Home'));
    }
  };

  return (
    <Swipeable
      className={cn('mobileAdditionalPanel', {
        [`mobileAdditionalPanelActive${panel}`]: panel,
      })}
      onSwipedRight={handleSwipeRight}
    >
      <header className="mobileAdditionalPanel-header">{panel}</header>
      <div className="mobileAdditionalPanel-body">
        <Choose>
          <When condition={panel === 'Search'}>
            <ErrorBoundary>
              <Search isMobile />
            </ErrorBoundary>
          </When>

          <When condition={panel === 'Notifications'}>
            <ErrorBoundary>
              <Notifications
                items={items}
                notificationsUnreadCount={notificationsUnreadCount}
                isLoaded={isLoaded}
                isInprogress={isInprogress}
              />
            </ErrorBoundary>
          </When>

          <When condition={panel === 'Settings'}>
            <SettingsMenu />
          </When>

          <Otherwise>
            <div />
          </Otherwise>
        </Choose>
      </div>
    </Swipeable>
  );
}
