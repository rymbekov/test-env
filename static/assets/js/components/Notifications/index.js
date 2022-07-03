import React, { useState, Fragment } from 'react';
import { arrayOf, object } from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import pluralize from 'pluralize';
import { Bell } from '@picsio/ui/dist/icons';
import { Icon } from '@picsio/ui';
import ErrorBoundary from '../ErrorBoundary';
import Logger from '../../services/Logger';
import { Button } from '../../UIComponents';
import { isHaveTeammatePermission } from '../../store/helpers/user';
import {
  getNotifications,
  clear,
  notificationMarkAsRead,
  clearChangedTagsIds,
} from '../../store/actions/notifications';
import * as utils from '../../shared/utils';
import { changeTree, setMobileAdditionalScreenPanel } from '../../store/actions/main';
import ua from '../../ua';
import PullToRefresh from '../PullToRefresh';
import Events from './events';
import Spinner from './Spinner';
import { navigate, reloadRoute } from '../../helpers/history';

let userScrollTop = 0;
export default function Notifications(props) {
  const {
    items, isInprogress, isLoaded, notificationsUnreadCount,
  } = props;
  const [page, setPage] = useState(1);
  const { openedTree } = useSelector((state) => state.main);
  const dispatch = useDispatch();

  const countPerPage = 10;

  const handleScroll = (event) => {
    const wrapper = event.currentTarget;
    userScrollTop = wrapper.scrollTop;
    if (wrapper.scrollHeight - wrapper.scrollTop === wrapper.clientHeight) {
      setPage(page + 1);
    }
  };

  const goToUrl = (path) => {
    const params = utils.deconstructQueryString(path);
    const { inboxId, tagId, archived } = params;

    if (inboxId) {
      if (openedTree !== 'inbox') {
        dispatch(changeTree('inbox', true));
      }
    }

    if (tagId) {
      if (!archived && openedTree !== 'collections') {
        dispatch(changeTree('collections', true));
      }
      if (archived && openedTree !== 'archive') {
        dispatch(changeTree('archive', true));
      }
    }

    if (ua.browser.isNotDesktop()) {
      dispatch(setMobileAdditionalScreenPanel('Home'));
    }

    navigate(path);
  };

  return (
    <>
      {/* {(isInprogress || !isLoaded) && <Spinner />} */}
      <div className="notifications">
        {(isInprogress || !isLoaded) && <Spinner />}
        <Choose>
          <When condition={items.length === 0}>
            <>
              <div className="notificationsPlaceholder">
                <div className="notificationsPlaceholderIcon">
                  <Icon size="inherit" color="inherit">
                    <Bell />
                  </Icon>
                </div>
                <div className="notificationsPlaceholderText">All caught up!</div>
              </div>
              {/* Buttons */}
              <div className="notificationsButtons">
                <div
                  className="picsioDefBtn picsioLink"
                  onClick={() => {
                    Logger.log('User', 'NotificationsAuditOpen');
                    navigate('audit');
                  }}
                >
                  Audit trail
                </div>
              </div>
            </>
          </When>
          <When condition={items.length > 0}>
            <>
              <div className="notificationsTopBar">
                {/* Title */}
                <div className="notificationsTitle">
                  You have {notificationsUnreadCount} new{' '}
                  {pluralize('notification', notificationsUnreadCount)}
                </div>
                <Button
                  id="button-clearNotifications"
                  className="picsioDefBtn"
                  icon="checkboxChecked"
                  onClick={() => {
                    Logger.log(
                      'User',
                      'NotificationsClear',
                      `Cleared ${notificationsUnreadCount} notifications`,
                    );
                    dispatch(clear());
                  }}
                  type="submit"
                >
                  Clear
                </Button>
              </div>

              <div className="notificationsItems" onScroll={handleScroll}>
                <PullToRefresh
                  onRefresh={() => {
                    Logger.log('User', 'NotificationsPullRefresh');
                    dispatch(getNotifications());
                  }}
                  spinnerSize={30}
                  spinnerColor="var(--secondary-contrast-color)"
                  refreshDuration={0}
                  shouldPullToRefresh={() => userScrollTop <= 1}
                  disabled={window.innerWidth > 1024}
                >
                  <>
                    {items.slice(0, page * countPerPage).map((event, index) => {
                      const Component = Events[event.type];
                      if (Component) {
                        return (
                          <div
                            className="notificationsItemsHolder"
                            onClick={
                              !event.read
                                ? () => {
                                  Logger.log('User', 'NotificationRead');
                                  dispatch(notificationMarkAsRead(event._id));
                                }
                                : null
                            }
                            key={event.timestamp + index}
                          >
                            {!event.read && <div className="notificationsItemStatus" />}
                            <ErrorBoundary>
                              <Component goToUrl={goToUrl} event={event} />
                            </ErrorBoundary>
                          </div>
                        );
                      }
                      Logger.info(`Event "${event.type}" is not displayed in notifications center`);
                      return null;
                    })}
                  </>
                </PullToRefresh>
              </div>
              {/* Buttons */}
              <div className="notificationsButtons">
                <Button
                  id="button-refreshPage"
                  className="picsioDefBtn"
                  onClick={() => {
                    Logger.log('User', 'NotificationsRefresh');
                    reloadRoute();
                    dispatch(clearChangedTagsIds());
                  }}
                  type="submit"
                >
                  Refresh page
                </Button>
                <div
                  className="picsioDefBtn picsioLink"
                  onClick={() => {
                    Logger.log('User', 'NotificationsAuditOpen');
                    navigate(
                      isHaveTeammatePermission('accessAuditTrail') ? 'audit' : 'audit?tab=analytics',
                    );
                  }}
                >
                  Audit trail
                </div>
              </div>
            </>
          </When>
          <Otherwise>{null}</Otherwise>
        </Choose>
      </div>
    </>
  );
}

Notifications.propTypes = {
  items: arrayOf(object),
  actions: object,
};
