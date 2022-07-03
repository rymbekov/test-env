import React from 'react';

import sortBy from 'lodash.sortby';
import PropTypes from 'prop-types';
import cn from 'classnames';
import TruncateMarkup from 'react-truncate-markup';
import { useDispatch, useSelector } from 'react-redux';
import Logger from '../../services/Logger';
import Tag from '../Tag';
import { changeTree } from '../../store/actions/main';
import { setSearchRoute } from '../../helpers/history';

const Lightboards = (props) => {
  const { assetId, items, onRemove } = props;
  const { openedTree } = useSelector((state) => state.main);
  const dispatch = useDispatch();

  const list = sortBy(items, ['path']).map((lightboard) => ({
    _id: lightboard._id,
    path: lightboard.path,
    name: lightboard.path.split('→').pop(),
  }));

  const handleClick = (lightboardId) => {
    Logger.log('User', 'ThumbnailLightboardClick');
    if (openedTree !== 'lightboards') {
      dispatch(changeTree('lightboards', true));
    }
    setSearchRoute({ lightboardId });
  };

  /**
   * Remove lightboard
   * @param {Object} lightboard
   */
  const handleRemove = (event, lightboard) => {
    event.stopPropagation();
    Logger.log('User', 'ThumbnailRemoveLightboard', { id: lightboard._id });
    onRemove(lightboard, [assetId]);
  };

  const leftEllipsis = (node) => {
    const usersRendered = node.props.children;

    return (
      <span className="catalogItem__chips-more">{`and ${
        list.length - usersRendered.length
      }...`}
      </span>
    );
  };

  return (
    <div className={cn('catalogItem__lightboards')}>
      <TruncateMarkup lines={1} lineHeight="24px" ellipsis={leftEllipsis}>
        <div>
          {list.map((item) => (
            <TruncateMarkup.Atom key={item._id}>
              <Tag
                key={item.path}
                type="lightboard"
                text={item.name}
                showCloseOnHover
                onClick={() => handleClick(item._id)}
                onClose={(event) => handleRemove(event, item)}
              />
            </TruncateMarkup.Atom>
          ))}
        </div>
      </TruncateMarkup>
    </div>
  );
};

Lightboards.defaultProps = {};

Lightboards.propTypes = {
  assetId: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      [PropTypes.string]: PropTypes.string,
    }),
  ).isRequired,

  onRemove: PropTypes.func.isRequired,
};

export default Lightboards;
