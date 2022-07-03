import React from 'react';

import events from '@picsio/events';
import localization from '../../../shared/strings';
import TagList from '../../TagList';
import NotificationSettings from '../../NotificationSettings';
import ErrorBoundary from '../../ErrorBoundary'; // eslint-disable-line

export default function WebsitesNotifications({ handlers, notificationsEmails, emailEventTypes }) {
  return (
    <div className="pageTabsContent__mainOptions">
      <div className="pageWebsites__inputsBlock">
        <div className="pageItemTitle">{localization.WEBSITES.titleNotificationsEmail}</div>
        <div className="pageWebsites__inputsBlock__content mediumInput">
          <TagList
            items={notificationsEmails}
            label={localization.WEBSITES.labelSelectEmail}
            placeholder={localization.WEBSITES.placeholderEnterEmail}
            onSubmit={handlers.onUpdateSubscribedEmails}
            onBlur={handlers.onUpdateSubscribedEmails}
          />
          <ErrorBoundary>
            <NotificationSettings
              events={events.getWebsiteTypes() || []}
              selectedEvents={emailEventTypes}
              isDisable={false}
              updateHandler={handlers.onUpdateNotificationsSettings}
              hideDontSend
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
