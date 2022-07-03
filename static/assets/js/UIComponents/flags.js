import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Icon } from '@picsio/ui';
import { isMobile } from 'react-device-detect';
// import { UnflaggedFlag, FlaggedFlag, RejectedFlag } from '@picsio/ui/dist/icons';
import { FlagEmpty, Flag, FlagRejected } from '@picsio/ui/dist/icons';

import localization from '../shared/strings';
import Tooltip from '../components/Tooltip';

class Flags extends React.Component {
  render() {
    const { value, onChange, className, highlight, error } = this.props;
    const iconSize = isMobile ? 'xl' : 'lg';

    return (
      <div
        className={cn('defaultFlagList', { [className]: className, isError: error })}
        onAnimationEnd={() => this.props.highlightAnimationReset('flag')}
      >
        <ul>
          <Tooltip content={localization.DETAILS.textRejectedFiles} placement="top">
            <li
              className={cn({
                act: value.indexOf('rejected') !== -1,
                highlightBlink: highlight,
              })}
              onClick={() => onChange('rejected')}
              ref={(node) => (this.rejected = node)}
            >
              <Icon size={iconSize}>
                <FlagRejected />
              </Icon>
            </li>
          </Tooltip>
          <Tooltip content={localization.DETAILS.textUnflaggedFiles} placement="top">
            <li
              className={cn({
                act: value.indexOf('unflagged') !== -1 || value.indexOf(null) !== -1,
                highlightBlink: highlight,
              })}
              onClick={() => onChange('unflagged')}
              ref={(node) => (this.unflagged = node)}
            >
              <Icon size={iconSize}>
                <FlagEmpty />
              </Icon>
            </li>
          </Tooltip>
          <Tooltip content={localization.DETAILS.textFlaggedFiles} placement="top">
            <li
              className={cn({
                act: value.includes('flagged') && value !== 'unflagged',
                highlightBlink: highlight,
              })}
              onClick={() => onChange('flagged')}
              ref={(node) => (this.flagged = node)}
            >
              <Icon size={iconSize}>
                <Flag />
              </Icon>
            </li>
          </Tooltip>
        </ul>
      </div>
    );
  }
}

Flags.propTypes = {
  className: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onChange: PropTypes.func,
};

Flags.defaultProps = {
  className: '',
  value: [],
  onChange: () => null,
};

export default Flags;
