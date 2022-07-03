import React from 'react';
import sortBy from 'lodash.sortby';
import PropTypes from 'prop-types';
import cn from 'classnames';
import TruncateMarkup from 'react-truncate-markup';
import { useDispatch, useSelector } from 'react-redux';
import Tag from '../Tag';
import Logger from '../../services/Logger';
import * as UtilsCollections from '../../store/utils/collections';
import { changeTree } from '../../store/actions/main';
import { setSearchRoute } from '../../helpers/history';

const Keywords = (props) => {
  const {
    assetId, items, keywordsEditable, onRemove,
  } = props;
  const { openedTree } = useSelector((state) => state.main);
  const dispatch = useDispatch();

  const list = sortBy(items, ['title']).map((item) => ({
    _id: item._id,
    title: item.path.split('→').pop(),
    path: item.path?.replace(/[→]/g, '/').substring(1),
  }));

  const handleClick = (keywordId) => {
    Logger.log('User', 'ThumbnailKeywordClick');

    if (openedTree !== 'keywords') {
      dispatch(changeTree('keywords', true));
    }

    setSearchRoute({ tagId: UtilsCollections.getRootId(), keywords: keywordId });
  };

  /**
   * Remove keyword
   * @param {Object} keyword
   */
  const handleRemove = (event, keyword) => {
    event.stopPropagation();
    Logger.log('User', 'ThumbnailRemoveKeyword', { id: keyword._id, name: keyword.title });
    onRemove(keyword._id, [assetId]);
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
    <div className={cn('catalogItem__collections')}>
      <TruncateMarkup lines={1} lineHeight="24px" ellipsis={leftEllipsis}>
        <div>
          {list.map((item) => (
            <TruncateMarkup.Atom key={item._id}>
              <Tag
                key={item.originalPath}
                type="keyword"
                text={item.title}
                showCloseOnHover
                onClick={() => handleClick(item._id)}
                onClose={keywordsEditable ? (event) => handleRemove(event, item) : null}
                tooltipText={item.path}
              />
            </TruncateMarkup.Atom>
          ))}
        </div>
      </TruncateMarkup>
    </div>
  );
};

Keywords.defaultProps = {};

Keywords.propTypes = {
  assetId: PropTypes.string.isRequired,
  keywordsEditable: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      [PropTypes.string]: PropTypes.string,
    }),
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default Keywords;
