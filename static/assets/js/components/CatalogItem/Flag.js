import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Icon } from '@picsio/ui';
// import { UnflaggedFlag, FlaggedFlag, RejectedFlag } from '@picsio/ui/dist/icons';
import { FlagEmpty, Flag, FlagRejected } from '@picsio/ui/dist/icons';
import { useDispatch } from 'react-redux';
import Logger from '../../services/Logger';
import { changeFlag } from '../../store/actions/assets';

export default function FlagComponent(props) {
  const dispatch = useDispatch();
  const {
    assetId, flag, flagChangeable, highlight, highlightAnimationReset,
  } = props;
  let flagIcon;
  const handleChangeFlag = () => {
    if (!flagChangeable) return;

    Logger.log('User', 'ThumbnailChangeFlag');
    dispatch(changeFlag([assetId]));
  };

  if (flag === 'rejected') {
    flagIcon = <FlagRejected />;
  } else if (flag === 'flagged') {
    flagIcon = <Flag />;
  } else {
    flagIcon = <FlagEmpty />;
  }

  return (
    <div
      className={cn('catalogItem__flag', {
        highlightScale: highlight,
      })}
      onClick={handleChangeFlag}
      onKeyPress={handleChangeFlag}
      onAnimationEnd={() => highlightAnimationReset('flag')}
      tabIndex={0}
      role="button"
    >
      <Icon size="md">
        {flagIcon}
      </Icon>
    </div>
  );
}

FlagComponent.propTypes = {
  assetId: PropTypes.string.isRequired,
  flag: PropTypes.string.isRequired,
  flagChangeable: PropTypes.bool.isRequired,
  highlight: PropTypes.bool.isRequired,
  highlightAnimationReset: PropTypes.func.isRequired,
};
