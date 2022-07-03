import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import events from '@picsio/events';
import Skeleton from 'react-loading-skeleton';
import { Checkbox, Radio, Input } from '../../UIComponents'; // eslint-disable-line
import Icon from '../Icon';
import WithSkeletonTheme from '../WithSkeletonTheme';
import localization from '../../shared/strings';

class NotificationSettings extends React.Component {
  eventsDescription = events.getEventsDescription();

  constructor(props) {
    super(props);

    this.state = {
      enableAll: this.props.selectedEvents.length === 0 && !this.props.isDisable,
      disableAll: this.props.isDisable,
      selectedEvents: this.props.selectedEvents || [],
      isEventsOpened: true,
      itemsInProgress: [],
      collectionId: this.props.collectionId || null,
      isLoading: this.props.isLoading,
      allowMentions: false,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.collectionId === undefined) {
      return null;
    }

    if (props.collectionId !== state.collectionId || props.isLoading !== state.isLoading) {
      return {
        enableAll: props.selectedEvents.length === 0 && !props.isDisable,
        disableAll: props.isDisable,
        selectedEvents: props.selectedEvents || [],
        itemsInProgress: [],
        collectionId: props.collectionId || null,
        isLoading: props.isLoading,
        allowMentions: props.allowMentions,
      };
    }

    return null;
  }

  handleEnableAll = () => {
    this.setState(
      { enableAll: true, disableAll: false, selectedEvents: this.props.events },
      async () => {
        this.setState({ itemsInProgress: this.addItemToProgress('enableAll') });
        await this.saveSettings();
        this.setState({ itemsInProgress: this.removeItemFromProgress('enableAll') });
      },
    );
  };

  handleDisableAll = () => {
    this.setState({ disableAll: true, enableAll: false, selectedEvents: [] }, async () => {
      this.setState({ itemsInProgress: this.addItemToProgress('disableAll') });
      await this.saveSettings();
      this.setState({ itemsInProgress: this.removeItemFromProgress('disableAll') });
    });
  };

  handleSendSelected = () => {
    this.setState({ enableAll: false, disableAll: false }, async () => {
      this.setState({ itemsInProgress: this.addItemToProgress('sendSelected') });
      await this.saveSettings();
      this.setState({ itemsInProgress: this.removeItemFromProgress('sendSelected') });
    });
  };

  handleCheckEvent = (event) => {
    let { selectedEvents } = this.state;
    if (selectedEvents.includes(event)) {
      selectedEvents = selectedEvents.filter((item) => item !== event);
    } else {
      selectedEvents = [...selectedEvents, event];
    }

    this.setState({ itemsInProgress: this.addItemToProgress(event), selectedEvents }, async () => {
      await this.saveSettings();
      this.setState({ itemsInProgress: this.removeItemFromProgress(event) });
    });
  };

  handleCheckMentions = () => {
    this.setState({ allowMentions: !this.state.allowMentions }, async () => {
      await this.saveSettings();
    });
  };

  handleOpenEvents = () => {
    this.setState({ isEventsOpened: !this.state.isEventsOpened });
  };

  saveSettings = async () => {
    const { state, props } = this;
    const settings = {};
    settings.disabled = state.disableAll;
    settings.types = state.disableAll || state.enableAll ? [] : state.selectedEvents;
    if (props.collectionId) {
      const { allowMentions } = state;
      settings.collectionId = props.collectionId;
      settings.allowMentions = allowMentions;
    }

    await this.props.updateHandler(settings);
  };

  addItemToProgress = (item) => {
    const items = this.state.itemsInProgress;
    return [...items, item];
  };

  removeItemFromProgress = (item) => {
    const progressItems = this.state.itemsInProgress;
    return progressItems.filter((progressItem) => progressItem !== item);
  };

  render() {
    const { props, state } = this;
    const {
      title,
      description,
      extraDescription,
      isLoading,
      hideDontSend,
      mentionsCheckbox,
    } = props;

    return (
      <WithSkeletonTheme>
        <div className="notificationSettings">
          <If condition={title}>
            <div className="notificationSettingsTitle">{title}</div>
          </If>
          <If condition={extraDescription}>
            <div className="notificationSettingsDescription">{extraDescription}</div>
          </If>
          <If condition={description}>{description}</If>
          <div className="notificationSettingsRadios">
            <div
              className={cn('notificationSettingsRadio', {
                skeletonPending: state.itemsInProgress.includes('enableAll'),
              })}
            >
              <Choose>
                <When condition={isLoading}>
                  <>
                    <span className="skeletonRadio">
                      <Skeleton circle width={16} height={16} />
                    </span>
                    <Skeleton width={146} height={16} />
                  </>
                </When>
                <Otherwise>
                  <Radio
                    onChange={this.handleEnableAll}
                    value={state.enableAll && !state.disableAll}
                    label={localization.NOTIFICATION_SETTINGS.enableAll}
                    disabled={props.readOnly}
                  />
                </Otherwise>
              </Choose>
            </div>
            <If condition={!hideDontSend}>
              <div
                className={cn('notificationSettingsRadio', {
                  skeletonPending: state.itemsInProgress.includes('disableAll'),
                })}
              >
                <Choose>
                  <When condition={isLoading}>
                    <>
                      <span className="skeletonRadio">
                        <Skeleton circle width={16} height={16} />
                      </span>
                      <Skeleton width={155} height={16} />
                    </>
                  </When>
                  <Otherwise>
                    <Radio
                      onChange={this.handleDisableAll}
                      value={state.disableAll}
                      label={localization.NOTIFICATION_SETTINGS.disableAll}
                      disabled={props.readOnly}
                    />
                  </Otherwise>
                </Choose>
              </div>
            </If>

            <div
              className={cn('notificationSettingsRadio', {
                skeletonPending: state.itemsInProgress.includes('sendSelected'),
              })}
            >
              <Choose>
                <When condition={isLoading}>
                  <>
                    <span className="skeletonRadio">
                      <Skeleton circle width={16} height={16} />
                    </span>
                    <Skeleton width={194} height={16} />
                  </>
                </When>
                <Otherwise>
                  <Radio
                    onChange={this.handleSendSelected}
                    value={!state.enableAll && !state.disableAll}
                    label={localization.NOTIFICATION_SETTINGS.sendSelected}
                    disabled={props.readOnly}
                  />
                </Otherwise>
              </Choose>
            </div>
          </div>
          <If condition={!state.enableAll && !state.disableAll}>
            <div className={cn('notificationSettingsEvents', { isOpened: state.isEventsOpened })}>
              <span className="notificationSettingsEventsOpener" onClick={this.handleOpenEvents}>
                <Icon name="collapse" />
              </span>
              <If condition={props.events.length === 0}>
                <div className="notificationSettingsTypesIsEmpty">
                  {localization.NOTIFICATION_SETTINGS.loading}
                </div>
              </If>
              <If condition={state.isEventsOpened}>
                {props.events
                  .filter((event) => this.eventsDescription[event])
                  .map((event) => (
                    <div
                      className={cn('notificationSettingsEvent', {
                        skeletonPending: state.itemsInProgress.includes(event),
                      })}
                      key={event}
                    >
                      <Checkbox
                        onChange={(value) => this.handleCheckEvent(event, value)}
                        value={state.selectedEvents.includes(event)}
                        label={this.eventsDescription[event].name}
                        disabled={props.readOnly}
                      />
                      <div className="notificationSettingsEventDescription">
                        {this.eventsDescription[event].description}
                      </div>
                    </div>
                  ))}
              </If>
            </div>
          </If>
          <If condition={mentionsCheckbox}>
            <Checkbox
              onChange={this.handleCheckMentions}
              value={state.allowMentions}
              label={localization.NOTIFICATION_SETTINGS.allowMentions}
              disabled={props.readOnly}
            />
          </If>
        </div>
      </WithSkeletonTheme>
    );
  }
}

export default NotificationSettings;

/** Prop types */
NotificationSettings.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  description: PropTypes.string,
  events: PropTypes.array,
  selectedEvents: PropTypes.array,
  isDisable: PropTypes.bool,
  updateHandler: PropTypes.func,
  readOnly: PropTypes.bool,
  hideDontSend: PropTypes.bool,
};

/** Default props */
NotificationSettings.defaultProps = {
  title: '',
  description: '',
  events: [],
  selectedEvents: [],
  isDisable: false,
  updateHandler: () => {},
  readOnly: false,
  isLoading: false,
  hideDontSend: false,
};
