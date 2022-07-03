import React from 'react';
import { func, array, bool, string } from 'prop-types';
import Tag from '../../Tag';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import { setSearchRoute } from '../../../helpers/history';

class Lightboards extends React.Component {
  handleClick = (lightboardId) => {
    const { changeTree, openedTree } = this.props;
    setSearchRoute({ lightboardId });
    if (changeTree && openedTree !== 'lightboards') {
      changeTree('lightboards', true);
    }
  };

  removeLightboard = (event, lightboard) => {
    event.stopPropagation();
    Logger.log('User', 'InfoPanelRemoveLightboard', { lightboardId: lightboard._id });
    this.props.remove(lightboard, this.props.selectedAssets);
  };

  render() {
    const { lightboards, lightboardsEditable } = this.props;

    /** if no lightboards - show placeholder */
    if (lightboards.length === 0) {
      return (
        <div className="detailsPanel__placeholder">
          {localization.DETAILS.panelPlaceholderNoLightboards}
        </div>
      );
    }

    /** else - show lightboards */
    return lightboards.map((lightboard) => {
      const name = lightboard.path.split('→').pop();

      return (
        <Tag
          key={lightboard._id}
          text={name}
          tooltipText={name}
          onClick={() => this.handleClick(lightboard._id)}
          onClose={
            !this.props.disabled && lightboardsEditable
              ? (e) => this.removeLightboard(e, lightboard)
              : null
          }
        />
      );
    });
  }
}

Lightboards.propTypes = {
  collection: array,
  lightboards: array,
  lightboardsEditable: bool,
  selectedAssets: array,
  disabled: bool,
  changeTree: func,
  openedTree: string,
};

export default (props) => (
    <Lightboards {...props} />
);
