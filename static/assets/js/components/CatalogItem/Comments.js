import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import Tooltip from '../Tooltip';
import { navigate } from '../../helpers/history';

function Comments(props) {
  const {
    assetId,
    newCommentsLength,
    highlight,
    allCommentsLength,
    highlightAnimationReset,
  } = props;

  const isEmpty = newCommentsLength < 1;

  const handleClickItem = (event) => {
    event.preventDefault();
    Logger.log('User', 'ThumbnailCommentsClick');
    navigate(`preview/${assetId}#comments${isEmpty ? '?focus=true' : ''}`);
  };
  return (
    <Tooltip content={localization.CATALOG_ITEM.tooltipGoToComments} placement="top">
      <div
        className={cn('catalogItem__comments', { isEmpty, highlightScale: highlight })}
        onClick={handleClickItem}
        onKeyPress={handleClickItem}
        onAnimationEnd={() => highlightAnimationReset('newComments')}
        tabIndex={0}
        role="button"
      >
        {newCommentsLength || allCommentsLength}
      </div>
    </Tooltip>
  );
}

Comments.propTypes = {
  assetId: PropTypes.string.isRequired,
  allCommentsLength: PropTypes.number.isRequired,
  newCommentsLength: PropTypes.number.isRequired,
  highlight: PropTypes.bool.isRequired,
  highlightAnimationReset: PropTypes.func.isRequired,
};

export default memo(Comments);
