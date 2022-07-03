import React from 'react';
import Logger from '../../services/Logger';
import sortBy from 'lodash.sortby';
import PropTypes from 'prop-types';
import cn from 'classnames';
import TruncateMarkup from 'react-truncate-markup';
import { useDispatch, useSelector } from 'react-redux';
import Tag from '../Tag';
import * as pathHelper from '../../helpers/paths';
import { changeTree } from '../../store/actions/main';
import { removeFromCollection } from '../../store/actions/assets';
import { setSearchRoute } from '../../helpers/history';

const Collections = (props) => {
  const { openedTree } = useSelector((state) => state.main);
  const dispatch = useDispatch();
  const {
    assetId,
    archived,
    items,
    allowRemoveTags,
    checkPermissionToDetachCollection,
  } = props;

  const list = sortBy(items, ['title']).map((collection) => {
    const path = pathHelper.removeRoot(collection.path);
    return {
      _id: collection._id,
      path,
      originalPath: collection.path,
      title: pathHelper.getCollectionName(path),
      pathItems: pathHelper.getPathItems(path),
    };
  });

  const handleClick = (collectionId) => {
    Logger.log('User', 'ThumbnailCollectionClick');
    const search = {
      tagId: collectionId,
    };
    if (archived) {
      search.archived = true;
    }

    if (!archived && openedTree !== 'collections') {
      dispatch(changeTree('collections', true));
    }
    if (archived && openedTree !== 'archive') {
      dispatch(changeTree('archive', true));
    }

    setSearchRoute(search);
  };

  /**
   * Remove tag
   * @param {Object} collection
   */
  const handleRemove = (event, collection) => {
    event.stopPropagation();
    Logger.log('User', 'ThumbnailRemoveCollection');
    dispatch(removeFromCollection(collection, [assetId]));
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
        <div className="catalogItem__collections-wrapper">
          {list.map((item) => {
            const showRemoveButton = allowRemoveTags && checkPermissionToDetachCollection(item.originalPath);
            return (
              <TruncateMarkup.Atom key={item._id}>
                <Tag
                  key={item.originalPath}
                  type="collection"
                  text={item.title}
                  showCloseOnHover
                  onClick={() => handleClick(item._id)}
                  onClose={showRemoveButton ? (event) => handleRemove(event, item) : null}
                  tooltipText={item.path}
                />
              </TruncateMarkup.Atom>
            );
          })}
        </div>
      </TruncateMarkup>
    </div>
  );
};

Collections.propTypes = {
  assetId: PropTypes.string.isRequired,
  archived: PropTypes.bool.isRequired,
  allowRemoveTags: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      [PropTypes.string]: PropTypes.string,
    }),
  ).isRequired,
  checkPermissionToDetachCollection: PropTypes.func.isRequired,
};

export default Collections;
