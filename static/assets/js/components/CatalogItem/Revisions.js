import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Logger from '../../services/Logger';
import Icon from '../Icon';
import localization from '../../shared/strings';
import { navigate } from '../../helpers/history';
import Tooltip from '../Tooltip';

function Revisions(props) {
  const {
    assetId, newRevisionsLength, highlight, highlightAnimationReset,
  } = props;

  const handleClickItem = (event) => {
    event.preventDefault();
    Logger.log('User', 'ThumbnailRevisionsClick');
    navigate(`preview/${assetId}#`);
  };

  return (
    <Tooltip content={localization.CATALOG_ITEM.tooltipGoToRevisions} placement="top">
      <div
        className={cn('catalogItem__revisions', { highlightScale: highlight })}
        onClick={handleClickItem}
        onKeyPress={handleClickItem}
        onAnimationEnd={() => highlightAnimationReset('newRevisions')}
        tabIndex={0}
        role="button"
      >
        <Icon name="revisions" />
        <span className="catalogItem__revisions-count">{newRevisionsLength}</span>
      </div>
    </Tooltip>
  );
}

Revisions.propTypes = {
  assetId: PropTypes.string.isRequired,
  newRevisionsLength: PropTypes.number.isRequired,
  highlight: PropTypes.bool.isRequired,
  highlightAnimationReset: PropTypes.func.isRequired,
};

export default memo(Revisions);
