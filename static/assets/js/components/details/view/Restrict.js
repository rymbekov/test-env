import React from 'react';
import {
  bool, func, array, string, oneOfType,
} from 'prop-types';
import cn from 'classnames';
import { CSSTransition } from 'react-transition-group';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import { datePickerPlaceholderWithTime, datePickerDateFormat, datePickerTimeFormat } from '../../../shared/dateLocale';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import { Input, Checkbox } from '../../../UIComponents';

import ErrorBoundary from '../../ErrorBoundary'; // eslint-disable-line
import '../styles/restrict.scss';

class Restrict extends React.Component {
  /** propTypes */
  static propTypes = {
    isVisible: bool,
    inProgress: bool,
    disabled: bool,
    selectedAssets: array,
    isRestricted: bool,
    reason: string,
    toggleVisibility: func,
    onChange: func,
    restrictStartAtPlaceholder: oneOfType([string, bool]),
    restrictExpiresAtPlaceholder: oneOfType([string, bool]),
    teamRestrictReason: string,
  };

  state = {
    initialReason: this.props.reason || null,
    reason: this.props.reason || null,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.reason !== state.initialReason) {
      return {
        reason: props.reason,
        initialReason: props.reason,
      };
    }

    return null;
  }

  handleChangeRestrictStatus = (value) => {
    const { reason } = this.state;
    const { expiresAt, startAt, teamRestrictReason } = this.props;
    const data = {
      isRestricted: value,
    };

    if (value) {
      if (
        reason !== localization.DETAILS.placeholderMultipleSelection
        && reason !== teamRestrictReason
        && reason !== localization.RESTRICT.RESTRICTED_REASON
      ) {
        data.reason = this.state.reason;
      }
      if (startAt) data.startAt = startAt;
      if (expiresAt) data.expiresAt = expiresAt;
    }

    Logger.log('User', 'RestrictChangeStatus', { assetIds: this.props.selectedAssets, data });
    this.props.onChange(this.props.selectedAssets, data);
  };

  handleTitleClick = () => this.props.toggleVisibility('detailsAssetRestrictVisibility');

  handleChangeReason = (event) => {
    const { value } = event.target;
    this.setState({ reason: value });
  };

  handleBlurReason = (event) => {
    const { value } = event.target;
    if (value === this.state.initialReason) return;
    Logger.log('User', 'RestrictChangeReason', { assetIds: this.props.selectedAssets });
    this.props.onChange(this.props.selectedAssets, {
      reason: value || null,
    });
  };

  handleChangeDates = (key, value) => {
    const keyName = key === 'startAt' ? 'StartAt' : 'ExpiresAt';
    const data = {
      [key]: value,
    };

    if (value) {
      data.isRestricted = true;
    }

    Logger.log('User', `RestrictChange${keyName}`, { assetIds: this.props.selectedAssets, value });

    this.props.onChange(this.props.selectedAssets, data);
  };

  renderDateFields = () => {
    let {
      expiresAt, startAt, restrictStartAtPlaceholder, restrictExpiresAtPlaceholder, disabled,
    } = this.props;
    let minTime; let startOfTheDay; let endOfTheDay; let minTimeExpiresAt; let
      minDateExpiresAt;

    if (!this.isMobile) {
      startAt = startAt && dayjs(startAt).isValid() ? new Date(startAt) : null;
      expiresAt = expiresAt && dayjs(expiresAt).isValid() ? new Date(expiresAt) : null;

      startOfTheDay = new Date(dayjs().startOf('day'));
      endOfTheDay = new Date(dayjs().endOf('day'));
      minTime = startAt && dayjs(startAt).isAfter(endOfTheDay) ? startOfTheDay : new Date();
      minTimeExpiresAt = expiresAt && dayjs(expiresAt).isAfter(endOfTheDay) ? startOfTheDay : new Date();
      minDateExpiresAt = startAt && dayjs(startAt).isAfter(new Date()) ? startAt : new Date();
    } else {
      startAt = startAt && dayjs(startAt).isValid() ? dayjs(startAt).format('YYYY-MM-DD') : '';
      expiresAt = expiresAt && dayjs(expiresAt).isValid() ? dayjs(expiresAt).format('YYYY-MM-DD') : '';
    }

    return (
      <>
        <div className="UIInput">
          <div className="UIInput__label">Start date</div>
          {this.isMobile ? (
            <Input
              isDefault
              type="date"
              placeholder="mm/dd/yyyy"
              value={startAt}
              onChange={(event) => this.handleChangeDates('startAt', new Date(event.target.value).toISOString())}
              disabled={disabled}
            />
          ) : (
            <ErrorBoundary>
              <DatePicker
                selected={startAt}
                placeholderText={
                  restrictStartAtPlaceholder || datePickerPlaceholderWithTime
                }
                onChange={(value) => this.handleChangeDates('startAt', value ? value.toISOString() : null)}
                selectsStart
                showTimeSelect
                timeFormat={datePickerTimeFormat}
                timeCaption="time"
                minTime={minTime}
                maxTime={endOfTheDay}
                dateFormat={`${datePickerDateFormat} ${datePickerTimeFormat}`}
                startDate={startAt}
                endDate={expiresAt}
                minDate={new Date()}
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
                disabled={disabled}
              />
            </ErrorBoundary>
          )}
        </div>
        <div className="UIInput">
          <div className="UIInput__label">Expires at</div>
          {this.isMobile ? (
            <Input
              isDefault
              type="date"
              placeholder="mm/dd/yyyy"
              value={expiresAt}
              onChange={(event) => this.handleChangeDates('expiresAt', new Date(event.target.value).toISOString())}
              disabled={disabled}
            />
          ) : (
            <ErrorBoundary>
              <DatePicker
                selected={expiresAt}
                placeholderText={
                  restrictExpiresAtPlaceholder || datePickerPlaceholderWithTime
                }
                onChange={(value) => this.handleChangeDates('expiresAt', value ? value.toISOString() : null)}
                selectsEnd
                showTimeSelect
                timeFormat={datePickerTimeFormat}
                timeCaption="time"
                minTime={minTimeExpiresAt}
                maxTime={endOfTheDay}
                dateFormat={`${datePickerDateFormat} ${datePickerTimeFormat}`}
                startDate={startAt}
                endDate={expiresAt}
                minDate={minDateExpiresAt}
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
                disabled={disabled}
              />
            </ErrorBoundary>
          )}
        </div>
      </>
    );
  };

  render() {
    const { props, state } = this;

    return (
      <div
        data-qa="details-component-restrict"
        className={cn('detailsPanel__item restrict', { act: props.isVisible, disabled: props.disabled })}
      >
        <div className="detailsPanel__title">
          <span className={cn('detailsPanel__title_text')} onClick={this.handleTitleClick}>
            {localization.DETAILS.textRestrict}
          </span>
          <div className="detailsPanel__title_buttons">
            {!props.disabled && (
              <Checkbox
                slide
                inProgress={props.inProgress}
                value={props.isRestricted}
                onChange={this.handleChangeRestrictStatus}
              />
            )}
          </div>
        </div>
        <CSSTransition in={props.isVisible} timeout={300} classNames="fade">
          <>
            {props.isVisible && (
              <div className="restrictSettings">
                <Input
                  label={localization.RESTRICT.restrictReasonLabel}
                  value={state.reason}
                  onChange={this.handleChangeReason}
                  onBlur={this.handleBlurReason}
                  disabled={props.disabled}
                />
                {this.renderDateFields()}
              </div>
            )}
          </>
        </CSSTransition>
      </div>
    );
  }
}
export default Restrict;
