import React from 'react';
import dayjs from 'dayjs';
import cn from 'classnames';
import { string, object, func } from 'prop-types';
import { Delete, Image } from '@picsio/ui/dist/icons';
import { Icon } from '@picsio/ui';
import Logger from '../../services/Logger';
import { Author } from '../UserComponent';

class Notification extends React.Component {
  static propTypes = {
    icon: func,
    thumbnail: object,
    goToUrl: func,
    assetID: string,
    time: string,
    avatar: string,
    children: object,
    name: string,
  };

  state = {
    isThumbnailLoading: this.props.thumbnail && this.props.thumbnail.isLoading,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.thumbnail && props.thumbnail.isLoading !== state.isThumbnailLoading) {
      return {
        isThumbnailLoading: props.thumbnail.isLoading,
      };
    }
    return null;
  }

  componentDidMount() {
    window.addEventListener('userChangeDateLocale', () => {
      this.forceUpdate();
    });
  }

  handleThumbnailLoad = () => {
    this.setState({ isThumbnailLoading: false });
  };

  render() {
    const { props, state } = this;
    const { icon: ControlIcon } = props;
    return (
      <div className="notificationsItem">
        <div className={cn('notificationsItemVisual', { highlightBlink: props.thumbnail && state.isThumbnailLoading })}>
          <Choose>
            <When condition={props.icon}>
              <Icon size="xxxl" color="inherit">
                <ControlIcon />
              </Icon>
            </When>
            <When condition={props.thumbnail?.url}>
              <div
                className={cn('notificationsItemThumbnail', { thumbnailTrashed: props.thumbnail.trashed })}
                onClick={() => {
                  Logger.log('User', 'NotificationClick');
                  if (props.assetID) {
                    props.goToUrl(`preview/${props.assetID}`);
                  }
                }}
              >
                <If condition={props.thumbnail.trashed}>
                  <Icon size="xxxl" color="inherit">
                    <Delete />
                  </Icon>
                </If>
                <img loading="lazy" src={props.thumbnail.url} onLoad={this.handleThumbnailLoad} />
              </div>
            </When>
            <Otherwise>
              <Icon size="xxxl" color="inherit">
                <Image />
              </Icon>
            </Otherwise>
          </Choose>
        </div>
        <div className="notificationsItemContent" onClick={() => Logger.log('User', 'NotificationClick')}>
          <Author
            size={25}
            avatar={props.avatar}
            name={props.name}
            additional={dayjs(props.time).format('lll')}
            avatarPicsio={props.avatarPicsio}
            className={cn({ hidden: props.hiddenInitiator })}
          />
          <div className="notificationsItemText">{props.children}</div>
        </div>
      </div>
    );
  }
}

export default Notification;
