import React, { createRef } from 'react';
import { DatePickerRange } from '@picsio/ui';
import dayjs from 'dayjs';
import { datePickerPlaceholderWithTime, datePickerDateFormat, datePickerTimeFormat } from '../../../shared/dateLocale';
import picsioConfig from '../../../../../../config';

import UrlEditor from '../../../UIComponents/UrlEditor';

import Logger from '../../../services/Logger';

import ua from '../../../ua';
import ErrorBoundary from '../../ErrorBoundary'; // eslint-disable-line
import { back } from '../../../helpers/history';
import localization from '../../../shared/strings';

import FieldsSettings from './FieldsSettings';

import './styles.scss';

class ScreenInboxSettings extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  /** state */
  state = {
    loading: false,
    errors: null,
  };

  inputRefs = {
    startAt: createRef(),
    expiresAt: createRef(),
  };

  destroy = () => {
    Logger.log('User', 'InboxSettingsHide');
    back();
  };

  handleChangeDatePickerStart = (value) => {
    const {
      handlers: { onChangeDates },
    } = this.props;
    let validValue = value;
    if (value instanceof Date) {
      validValue = value.toISOString();
    }
    onChangeDates({ startAt: validValue });
  }

  handleChangeDatePickerEnd = (value) => {
    const {
      handlers: { onChangeDates },
    } = this.props;
    let validValue = value;
    if (value instanceof Date) {
      validValue = value.toISOString();
    }
    onChangeDates({ expiresAt: validValue });
  }

  // Fix bug with clear button on IOS. Follow this link for more information - https://github.com/facebook/react/issues/8938#issuecomment-519074141
  handleFocusDate = (event) => {
    event.nativeEvent.target.defaultValue = '';
  };

  renderDateFields = () => {
    let { expiresAt, startAt } = this.props.inbox;
    let minTime; let startOfTheDay; let endOfTheDay; let minTimeExpiresAt;

    if (!this.isMobile) {
      startAt = startAt && dayjs(startAt).isValid() ? new Date(startAt) : null;
      expiresAt = expiresAt && dayjs(expiresAt).isValid() ? new Date(expiresAt) : null;
      startOfTheDay = new Date(dayjs().startOf('day'));
      endOfTheDay = new Date(dayjs().endOf('day'));
      minTime = startAt && dayjs(startAt).isAfter(endOfTheDay) ? startOfTheDay : new Date();
      minTimeExpiresAt = expiresAt && dayjs(expiresAt).isAfter(endOfTheDay) ? startOfTheDay : new Date();
    } else {
      startAt = startAt && dayjs(startAt).isValid() ? dayjs(startAt).format('YYYY-MM-DD') : '';
      expiresAt = expiresAt && dayjs(expiresAt).isValid() ? dayjs(expiresAt).format('YYYY-MM-DD') : '';
    }

    return (
      <>
        <div className="UIInput">
          <DatePickerRange
            placeholderText={datePickerPlaceholderWithTime}
            onInputChangeStart={(value) => this.handleChangeDatePickerStart(value)}
            onInputChangeEnd={(value) => this.handleChangeDatePickerEnd(value)}
            startDatePlaceholderText="Start date"
            endDatePlaceholderText="DD Mon YYYY HH:mm"
            datePickerTimeFormat={datePickerTimeFormat}
            datePickerDateFormat={`${datePickerDateFormat} ${datePickerTimeFormat}`}
            showTimeSelect
            labelStartDate="Start date"
            startDateMinDate={new Date()}
            endDateMinTime={minTimeExpiresAt}
            endDateMaxTime={endOfTheDay}
            startDateMinTime={minTime}
            startDateMaxTime={endOfTheDay}
            labelEndDate="End Date"
            timeCaption="time"
            startDate={startAt}
            endDate={expiresAt}
            popperClassName="datepickerFixed"
            popperPlacement="bottom-center"
            popperProps={{ positionFixed: true }}
            popperModifiers={{
              offset: {
                enabled: true,
                offset: '5px, 10px',
              },
              preventOverflow: {
                enabled: true,
                escapeWithReference: true,
                boundariesElement: 'scrollParent',
              },
            }}
          />
        </div>
      </>
    );
  };

  render() {
    const { inbox, handlers } = this.props;
    const inboxPicsioFullUrl = new URL(picsioConfig.INBOX_PICSIO_DOMAIN);
    const domains = [inboxPicsioFullUrl.hostname];

    return (
      <div className="sharingSettings">
        <div className="pageItemTitle">{localization.WEBSITES.titleMainOptions}</div>
        <div className="pageWebsites__inputsBlock__content">
          <div className="website-customization">
            <div className="website-customization-fields">
              <UrlEditor
                id={inbox._id}
                label="Inbox link"
                disabled={inbox.isAliasChanging}
                domains={domains}
                selectedUrl={inbox.alias}
                handleUrlChange={handlers.onChangeAlias}
                isDisabledCopy={!inbox.isShared}
                tooltipText={localization.DETAILS.disabledCopyInboxTooltipText}
                toastText={localization.DETAILS.inboxUrlCopied}
              />
              <div className="websiteDateFields">{this.renderDateFields()}</div>
            </div>
          </div>
          <FieldsSettings inbox={inbox} />
        </div>
      </div>
    );
  }
}

export default ScreenInboxSettings;
