import React from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import sortBy from 'lodash.sortby';
import remove from 'lodash.remove';
import dayjs from 'dayjs';
import { DatePickerRange } from '@picsio/ui';
import * as api from '../../../api/index';
import Spinner from '../../spinner';

import store from '../../../store';
import { changeTree, setMobileAdditionalScreenPanel } from '../../../store/actions/main';

import localization from '../../../shared/strings';
import { Input } from '../../../UIComponents';

import Events from './events/index';

import timeOptions from '../configs/timeOptions';
import eventOptions from '../configs/eventOptions';
import Logger from '../../../services/Logger';
import Avatar from '../../Avatar';
import ErrorBoundary from '../../ErrorBoundary';
import Icon from '../../Icon';

import { datePickerDateFormat } from '../../../shared/dateLocale';
import { isHaveTeammatePermission } from '../../../store/helpers/user';
import { normalizeUserAvatarSrc } from '../../../store/helpers/teammates';

import ua from '../../../ua';
import Tag from '../../Tag';
import * as utils from '../../../shared/utils';
import { back, navigate } from '../../../helpers/history';

const mainActions = bindActionCreators({ changeTree, setMobileAdditionalScreenPanel }, store.dispatch);
const eventOptionsSorted = sortBy(eventOptions, ['text']);
export default class AuditTrailTab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdowns: {
        time: false,
        user: false,
        event: false,
      },

      selectedDropdownItems: {
        time: 'any',
        user: 'any',
        event: 'any',
      },

      eventsList: [],

      customDate: ['', ''],
      loading: true,
      usersSearchValue: '',
      isCustomDateSelected: false,
    };

    this.pageNumber = 1;
    this.isFull = false;
    this.spinner = null;
  }

  handleUsersSearchOnChange = (event) => {
    this.setState({ usersSearchValue: event.target.value });
  }

  render() {
    const { teammates } = this.props;
    const { customDate, selectedDropdownItems } = this.state;
    const filteredTeammates = teammates.filter(teammate => teammate.displayName.toLowerCase().includes(this.state.usersSearchValue.toLowerCase()));
    const { time: selectedTime, user: selectedUser, event: selectedEvent } = selectedDropdownItems;

    const selectedTimeItem = timeOptions.find((n) => n.value === selectedTime);

    return (
      <div className="page pageAudit">
        {/* <ToolbarScreenTop title={[localization.AUDIT.title]} onClose={this.destroy} helpLink="audit" /> */}
        <div className="pageContent">
          {/* <div className="pageInnerContent"> */}
          <div className="pageAudit__topControls">
            <div className={`timeDropdown ${this.state.dropdowns.time ? 'act' : ''}`}>
              <div className="timeDropdown__head">
                <div
                  className="timeDropdown__head__item"
                  onClick={(e) => {
                    this.toggleDropdown(e, 'time');
                  }}
                >
                  <span className="timeDropdown__head__text">
                    {timeOptions.find((n) => n.value === selectedTime).value === 'any' ? 'Anytime' : 'Time'}
                  </span>
                  <span className="timeDropdown__head__triangle" />
                </div>
              </div>
              <ul className="timeDropdown__list">{timeOptions.map(this.renderTimeOption)}</ul>
              <div className="timeDropdown__checkedItems">
                {selectedTimeItem.value !== 'any'
                  && (selectedTimeItem.value !== 'custom'
                    || (selectedTimeItem.value === 'custom' && customDate.length)) && (
                    <Tag
                    text={
                      selectedTimeItem.value !== 'custom'
                        ? selectedTimeItem.text
                        : this.generateFromToDates(customDate)
                    }
                  />
                )}
              </div>
            </div>

            <div className={`userDropdown ${this.state.dropdowns.user ? 'act' : ''}`}>
              <div className="userDropdown__head">
                <div
                  className="userDropdown__head__item"
                  onClick={(e) => {
                    this.toggleDropdown(e, 'user');
                  }}
                >
                  <span className="userDropdown__head__text">{Array.isArray(selectedUser) ? 'Users' : 'Any user'}</span>
                  <span className="userDropdown__head__triangle" />
                </div>
              </div>
              <ul className="userDropdown__list">
                <div className="searchUsers">
                  <Input
                    placeholder="Search users"
                    value={this.state.usersSearchValue}
                    onChange={(evt) => this.handleUsersSearchOnChange(evt)}
                  />
                </div>
                <li
                  className={`userDropdown__list__item ${selectedUser === 'any' && 'userDropdown__list__item__act'}`}
                  onClick={(e) => {
                    this.onChooseUser(e, 'any');
                  }}
                >
                  <span className="userDropdown__list__item__avatar">
                    <Icon name="avatar" />
                  </span>
                  <span>{localization.AUDIT.tabTitleUser}</span>
                </li>
                {filteredTeammates.map((user) => {
                  const act = selectedUser !== 'any' && selectedUser.includes(user._id);
                  return (
                    <li
                      className={`userDropdown__list__item ${act && 'userDropdown__list__item__act'}`}
                      key={user._id}
                      onClick={(e) => {
                        this.onChooseUser(e, user._id);
                      }}
                    >
                      <Avatar src={user.avatar} userName={user.displayName} size={20} />
                      <Icon name="ok" />
                      <span>{user.displayName}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="userDropdown__checkedItems">
                {Array.isArray(selectedUser)
                  && selectedUser.map((userId) => (
                    <Tag
                      key={userId}
                      type="user"
                      avatar={teammates.find((user) => user._id === userId).avatar}
                      text={teammates.find((user) => user._id === userId).displayName}
                    />
                  ))}
              </div>
            </div>

            <div className={`eventDropdown ${this.state.dropdowns.event ? 'act' : ''}`}>
              <div className="eventDropdown__head">
                <div
                  className="eventDropdown__head__item"
                  onClick={(e) => {
                    this.toggleDropdown(e, 'event');
                  }}
                >
                  <span className="eventDropdown__head__text">
                    {Array.isArray(selectedEvent) ? 'Events' : 'Any event'}
                  </span>
                  <span className="eventDropdown__head__triangle" />
                </div>
              </div>
              <ul className="eventDropdown__list">
                <li
                  className={`eventDropdown__list__item ${
                    selectedEvent === 'any' ? 'eventDropdown__list__item__act' : ''
                  }`}
                  onClick={(e) => {
                    this.onChooseEvent(e, 'any');
                  }}
                >
                  {localization.AUDIT.tabTitleEvent}
                </li>
                {eventOptionsSorted.map((option) => {
                  const act = selectedEvent !== 'any' && selectedEvent.includes(option.value);
                  return (
                    <li
                      className={`eventDropdown__list__item ${act ? 'eventDropdown__list__item__act' : ''}`}
                      key={option.value}
                      onClick={(e) => {
                        this.onChooseEvent(e, option.value);
                      }}
                    >
                      <Icon name="ok" />
                      <span>{option.text}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="eventDropdown__checkedItems">
                {Array.isArray(selectedEvent)
                  && selectedEvent.map((eventType) => (
                    <Tag text={eventOptionsSorted.find((n) => n.value === eventType).text} />
                  ))}
              </div>
            </div>

            <div className="linkHolder" style={{ display: 'none' }}>
              <div>
                <a className="picsioLink">{localization.AUDIT.downloadCSV}</a>
              </div>
            </div>
          </div>

          <div
            className="pageAudit__list"
            ref={(el) => {
              this.ElList = el;
            }}
          >
            {this.renderPageList()}
          </div>
          {/* </div> */}
        </div>
      </div>
    );
  }

  retentionStringSetter() {
    const { retentionPeriod } = this.props.user.subscriptionFeatures;

    const planConfig = {
      1: '1-day',
      7: '7-days',
      14: '14-days',
      30: '1-month',
      182: '6-months',
      365: '1-year',
    };

    if (retentionPeriod >= 1095) {
      return '3-years';
    }
    return planConfig[retentionPeriod];
  }

  renderPageList() {
    const { eventsList, selectedDropdownItems } = this.state;
    const emptySearch =			selectedDropdownItems.user === 'any'
      && selectedDropdownItems.event === 'any'
      && selectedDropdownItems.time === 'any';

    if (eventsList.length) {
      return (
        <>
          {eventsList.map(this.renderListItem)}
          <If condition={this.isFull}>
            <div className="retentionString">
              Your current subscription plan has a {this.retentionStringSetter()} retention period.
              <br />
              <If condition={!ua.isPWA() && !ua.isMobileApp()}>
                <>
                  Please
                  <span onClick={() => this.goToUrl('/billing?tab=overview')} className="picsioLink">
                    {' '}
                    upgrade your billing plan{' '}
                  </span>
                  to extend the events retention period.
                </>
              </If>
            </div>
          </If>
        </>
      );
    } if (emptySearch) {
      return this.renderEmptyEvents();
    }
    return this.renderEmptySearch();
  }

  renderEmptySearch() {
    return (
      <div className="notice">
        <div className="notice__icon">
          <Icon name="lensList" />
        </div>
        <div
          className="notice__text"
          dangerouslySetInnerHTML={{ __html: utils.sanitizeXSS(localization.AUDIT.textNothingFound) }}
        />
      </div>
    );
  }

  renderEmptyEvents() {
    return (
      <div className="notice">
        <div className="notice__icon">
          <Icon name="penList" />
        </div>
        <div className="notice__text">
          <div>{localization.AUDIT.textNoRecords}</div>
        </div>
      </div>
    );
  }

  renderTimeOption = (item) => {
    const { customDate, selectedDropdownItems, isCustomDateSelected } = this.state;
    const { time: selectedTime } = selectedDropdownItems;
    const isMobile = ua.browser.isNotDesktop();

    if (item.value === 'any') {
      return (
        <li
          className={`timeDropdown__list__item ${selectedTime === item.value ? 'timeDropdown__list__item__act' : ''}`}
          onClick={(e) => {
            this.onChooseDate(e, item.value);
          }}
          key={item.value}
        >
          {item.text}
        </li>
      );
    } if (item.value === 'custom') {
      return (
        <li
          onClick={(e) => {
            this.onChooseDate(e, item.value);
          }}
          key={item.value}
        >
          <div className={`timeDropdown__list__item blur ${selectedTime === item.value ? 'timeDropdown__list__item__act' : ''}`}>{item.text}</div>
          <If condition={isCustomDateSelected}>
            <div className="auditTrailCustomDatePicker">
              <DatePickerRange
                startDate={customDate[0]}
                endDate={customDate[1]}
                onInputChangeStart={this.onChangeCustomDateStart}
                onInputChangeEnd={this.onChangeCustomDateEnd}
                startDatePlaceholderText="Start date"
                endDatePlaceholderText="End date"
                datePickerDateFormat={datePickerDateFormat}
                datePickerOrder="column"
              />
            </div>
          </If>
        </li>
      );
    }
    return (
      <li
        className={`timeDropdown__list__item ${selectedTime === item.value ? 'timeDropdown__list__item__act' : ''}`}
        onClick={(e) => {
          this.onChooseDate(e, item.value);
        }}
        key={item.value}
      >
        {item.text}
      </li>
    );
  };

  /**
   * Render event item
   * @param {Object} item - event
   * @param {number} index
   * @returns {JSX}
   */
  renderListItem = (item, index) => {
    const isRenderDate = index === 0
      || new Date(item.timestamp).getDate() !== new Date(this.state.eventsList[index - 1].timestamp).getDate();

    const isLastDayEvent = this.state.eventsList[index + 1]
      ? new Date(item.timestamp).getDate() !== new Date(this.state.eventsList[index + 1].timestamp).getDate()
      : true;

    const Event = Events[item.type];

    if (!Event) {
      Logger.info(`Event [${item.type}] is not displayed`);
      return null;
    }

    return (
      <ErrorBoundary key={`error_${item._id}${index}`}>
        <Event event={item} goToUrl={this.goToUrl} isRenderDate={isRenderDate} isLastDayEvent={isLastDayEvent} />
      </ErrorBoundary>
    );
  };

  goToUrl = (url) => {
    const params = utils.deconstructQueryString(url);
    const { tagId, inboxId, archived } = params;
    const { openedTree } = this.props;

    if (!archived && tagId && openedTree !== 'collections') {
      mainActions.changeTree('collections', true);
    }

    if (archived && tagId && openedTree !== 'archive') {
      mainActions.changeTree('archive', true);
    }

    if (inboxId && openedTree !== 'inbox') {
      mainActions.changeTree('inbox', true);
    }

    if (ua.browser.isNotDesktop()) {
      mainActions.setMobileAdditionalScreenPanel('Home');
    }

    window.open(url, '_blank');
  };

  onBodyClick = (event) => {
    if (event.target.nodeName.toUpperCase() === 'INPUT') return;

    this.setState({
      dropdowns: {
        time: false,
        user: false,
        event: false,
      },
    });

    document.removeEventListener('click', this.onBodyClick);
  };

  toggleDropdown = (e, value) => {
    e.stopPropagation();

    const dropdowns = {

      ...this.state.dropdowns,
      time: false,
      user: false,
      event: false,
      [value]: !this.state.dropdowns[value],
    };

    this.setState({ dropdowns }, () => {
      if (this.state.dropdowns[value]) {
        document.addEventListener('click', this.onBodyClick);
      } else {
        document.removeEventListener('click', this.onBodyClick);
      }
    });
  };

  onChangeCustomDateStart = (value) => {
    const customDate = Array.from(this.state.customDate);
    customDate[0] = value;
    this.setState({ customDate, eventsList: [] }, this.fetch);
  }

  onChangeCustomDateEnd = (value) => {
    const customDate = Array.from(this.state.customDate);
    customDate[1] = value;
    this.setState({ customDate, eventsList: [] }, this.fetch);
  }

  generateFromToDates(customDate) {
    let [fromDate, toDate] = customDate;

    fromDate && (fromDate = `from ${dayjs(fromDate).format('ll')}`);
    toDate && (toDate = `to ${dayjs(toDate).format('ll')}`);

    if (fromDate && toDate) {
      return `${fromDate} ${toDate}`;
    }
    return fromDate || toDate;
  }

  onChooseDate = (e, value) => {
    e.stopPropagation();

    if (value !== 'custom') {
      this.setState(
        {
          selectedDropdownItems: { ...this.state.selectedDropdownItems, time: value },
          dropdowns: {
            time: false,
            user: false,
            event: false,
          },
          eventsList: [],
          customDate: ['', ''],
          isCustomDateSelected: false,
        },
        this.fetch,
      );
      document.querySelectorAll('.btr-dateinput-value').forEach((i) => (i.innerText = ''));
    } else {
      this.setState({
        selectedDropdownItems: { ...this.state.selectedDropdownItems, time: value },
        isCustomDateSelected: true,
      });
    }

    document.removeEventListener('click', this.onBodyClick);
  };

  onChooseUser = (e, value) => {
    e.stopPropagation();

    const selectedDropdownItems = { ...this.state.selectedDropdownItems };

    if (value === 'any') {
      selectedDropdownItems.user = 'any';
    } else if (Array.isArray(selectedDropdownItems.user)) {
      selectedDropdownItems.user.includes(value)
        ? remove(selectedDropdownItems.user, (i) => i === value)
        : selectedDropdownItems.user.push(value);
    } else {
      selectedDropdownItems.user = [value];
    }

    this.setState(
      {
        selectedDropdownItems,
        dropdowns: {
          time: false,
          user: false,
          event: false,
        },
        eventsList: [],
      },
      this.fetch,
    );

    document.removeEventListener('click', this.onBodyClick);
  };

  onChooseEvent = (e, value) => {
    e.stopPropagation();

    const selectedDropdownItems = { ...this.state.selectedDropdownItems };

    if (value === 'any') {
      selectedDropdownItems.event = 'any';
    } else if (Array.isArray(selectedDropdownItems.event)) {
      selectedDropdownItems.event.includes(value)
        ? remove(selectedDropdownItems.event, (i) => i === value)
        : selectedDropdownItems.event.push(value);
    } else {
      selectedDropdownItems.event = [value];
    }

    this.setState(
      {
        selectedDropdownItems,
        dropdowns: {
          time: false,
          user: false,
          event: false,
        },
        eventsList: [],
      },
      this.fetch,
    );

    document.removeEventListener('click', this.onBodyClick);
  };

  componentDidMount() {
    this.fetch();
    this.ElList.addEventListener('scroll', (e) => {
      const { scrollHeight, clientHeight, scrollTop } = e.currentTarget;
      const value = scrollHeight - clientHeight - scrollTop;
      !this.spinner && !this.isFull && value <= 100 && this.fetch();
    });
  }

  fetch = async () => {
    if (isHaveTeammatePermission('accessAuditTrail')) {
      const { selectedDropdownItems, customDate } = this.state;

      const params = {};

      if (this.state.eventsList.length) {
        params.from = this.state.eventsList[this.state.eventsList.length - 1].timestamp;
      }

      if (selectedDropdownItems.user !== 'any') {
        params.userIds = selectedDropdownItems.user;
      }

      if (selectedDropdownItems.event !== 'any') {
        params.types = selectedDropdownItems.event;
      }

      if (selectedDropdownItems.time === 'custom') {
        const [fromDate, toDate] = customDate;
        params.range = [];
        fromDate && (params.range[0] = dayjs(fromDate).valueOf());
        toDate
          && (params.range[1] = dayjs(toDate)
            .add(1, 'day')
            .valueOf());
      } else if (selectedDropdownItems.time !== 'any') {
        params.range = timeOptions.find((n) => n.value === selectedDropdownItems.time).range;
      }

      this.initSpinner();

      try {
        let events = await api.get('/events/audit', { params });
        events = events.map((item) => {
          if (item.initiator) {
            const user = this.props.teammates.find((teammate) => teammate._id === item.initiator._id);
            if (user) {
              return {
                ...item,
                initiator: {
                  avatar: user.avatar,
                  displayName: user.displayName,
                  email: user.email,
                },
              };
            }
            if (item.initiator.avatar) {
              return {
                ...item,
                initiator: {
                  ...item.initiator,
                  avatar: normalizeUserAvatarSrc(item.initiator.avatar, 'small', true),
                },
              };
            }
          }
          return item;
        });

        this.isFull = events.length === 0;
        this.setState({ eventsList: [...this.state.eventsList, ...events] }, () => {
          const { scrollHeight, clientHeight } = this.ElList;
          scrollHeight <= clientHeight && !this.isFull && this.fetch();
        });
        this.destroySpinner();
      } catch (err) {
        console.error(err);
        this.destroySpinner();
      }
    }
  };

  initSpinner = () => {
    this.destroySpinner();
    this.spinner = new Spinner({
      parentEl: document.querySelector('.wrapperPageAudit'),
      classList: ['partial'],
      styleList: {
        'z-index': '11',
      },
    });
  };

  destroySpinner = () => {
    if (this.spinner) {
      this.spinner.destroy();
      this.spinner = null;
    }
  };

  destroy = () => {
    Logger.log('User', 'SettingsAuditTrailHide');
    back('/search');
    ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).parentNode);
  };
}
