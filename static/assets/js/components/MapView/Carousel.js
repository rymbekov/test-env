import React from 'react';
import cn from 'classnames';
import { array, objectOf, func } from 'prop-types';
import Asset from './Asset';
import Spinner from './Spinner';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import Icon from '../Icon';

class Carousel extends React.PureComponent {
  static propTypes = {
    assets: array,
    assetsActions: objectOf(func),
    onChangeSlide: func,
    ids: array,
  };

  state = {
    activeIndex: 0,
  };

  handleClickPrev = () => {
    const { activeIndex } = this.state;
    if (activeIndex < 1) return;
    this.props.onChangeSlide(activeIndex - 1);
    this.setState({ activeIndex: activeIndex - 1 });
    Logger.log('User', 'MapViewCarouselPrev');
  };

  handleClickNext = () => {
    const { activeIndex } = this.state;
    const { assets } = this.props;
    if (activeIndex >= assets.length - 1) return;
    this.props.onChangeSlide(activeIndex + 1);
    this.setState({ activeIndex: activeIndex + 1 });
    Logger.log('User', 'MapViewCarouselNext');
  };

  render() {
    const { props, state } = this;
    if (!props.assets.length) {
      return (
        <div className="markerAsset">
          <div className="markerAssetImage">
            <Spinner title={localization.MAPVIEW.spinnerLoadingAssets} />
          </div>
        </div>
      );
    }

    return (
      <>
        <span className={cn('prev', { disabled: state.activeIndex < 1 })} onClick={this.handleClickPrev}>
          <Icon name="arrowPrevPreview" />
        </span>
        <Asset data={props.assets[state.activeIndex]} assetsActions={props.assetsActions} />
        <span
          className={cn('next', { disabled: state.activeIndex >= props.assets.length - 1 })}
          onClick={this.handleClickNext}
        >
          <Icon name="arrowNextPreview" />
        </span>
        <span className="pagination">
          {state.activeIndex + 1}/{props.ids.length}
        </span>
      </>
    );
  }
}

export default Carousel;
