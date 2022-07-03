import React from 'react';
import cn from 'classnames';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import Icon from '../Icon';
import { navigate } from '../../helpers/history';
import sendEventToIntercom from '../../services/IntercomEventService';

class ScreenTab extends React.Component {
  constructor(props) {
    super(props);
    this.pageMenu = React.createRef();

    this.state = {
      hiddenArrow: '',
    };
  }

  componentDidMount() {
    this.initStateArrow();
  }

  renderTab = (item) => {
    const className = cn('pageMenuItem', { act: item.id === this.props.actTab });
    if (item.id !== 'watermarking' || (item.id === 'watermarking' && this.props.featureFlags?.watermarks)) {
      return (
        <div
          className={className}
          onClick={() => {
            this.navigateToTab(item.id);
          }}
          key={item.id}
        >
          <span className="pageMenuItemIcon">
            {typeof item.icon === 'string'
              ? <Icon name={item.icon} />
              : item.icon}
          </span>
          <span>{item.title}</span>
          {item.badge && <sup>{item.badge}</sup>}
        </div>
      );
    }
  };

  navigateToTab(tabName) {
    const name = this.props.name || '';

    const tabNameForEvent = utils.capitalizeFirstLetter(tabName);
    // for website we have different event naming, so we need customizate it
    if (name === 'WebSite') {
      Logger.log('User', `${name}Settings${tabNameForEvent}`);
    } else {
      if (`${name}${tabNameForEvent}` === 'MyTeamSecurity') {
        sendEventToIntercom('security my team');
      }
      if (`${name}${tabNameForEvent}` === 'MyAccountSecurity') {
        sendEventToIntercom('security my account');
      }
      if (`${name}${tabNameForEvent}` === 'MyTeamBranding') {
        sendEventToIntercom('branding settings');
      }
      if (`${name}${tabNameForEvent}` === 'MyTeamIntegrations') {
        sendEventToIntercom('integrations settings');
      }
      if (`${name}${tabNameForEvent}` === 'MyTeamAiKeywords') {
        sendEventToIntercom('ai settings');
      }
      Logger.log('User', `Settings${name}${tabNameForEvent}`);
    }
    navigate(`${this.props.rootPath}?tab=${tabName}`);
  }

  handlerClickArrow = () => {
    const pageMenu = this.pageMenu.current;
    const pageMenuWidth = pageMenu.offsetWidth;
    if (pageMenu.scrollLeft === 0) {
      pageMenu.scrollLeft = pageMenuWidth;
      this.setState({ hiddenArrow: 'right' });
    } else {
      pageMenu.scrollLeft = 0;
      this.setState({ hiddenArrow: 'left' });
    }
  };

  handlerScroll = (e) => {
    const el = e.target;
    const widthScrolledPart = el.scrollWidth - el.scrollLeft;
    if (widthScrolledPart === el.scrollWidth) {
      this.setState({ hiddenArrow: 'left' });
    } else if (widthScrolledPart < el.scrollWidth && widthScrolledPart > el.offsetWidth) {
      this.setState({ hiddenArrow: '' });
    } else {
      this.setState({ hiddenArrow: 'right' });
    }
  };

  initStateArrow = () => {
    const pageMenu = this.pageMenu.current;
    const paddingPageMenu = 15;
    if (pageMenu) {
      const stateArrow = pageMenu.offsetWidth + 2 * paddingPageMenu > pageMenu.scrollWidth ? 'all' : 'left';
      this.setState({ hiddenArrow: stateArrow });
    }
  };

  render() {
    const { props } = this;
    return (
      <div className={`pageMenuWrapper hideArrow${utils.capitalizeFirstLetter(this.state.hiddenArrow)}`}>
        <div className="pageMenu" onScroll={this.handlerScroll} ref={this.pageMenu}>
          {props.configTabs.map(this.renderTab)}
          {!!props.extraContent && props.extraContent}
        </div>
        <Icon name="arrowPrevPreview" onClick={this.handlerClickArrow} />
        <Icon name="arrowNextPreview" onClick={this.handlerClickArrow} />
      </div>
    );
  }
}

export default ScreenTab;
