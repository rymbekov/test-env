import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import union from 'lodash.union';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import SkeletonItem from './SkeletonItem';
import DropdownTreeIcon from './DropdownTreeIcon';

export default function DropdownTree(props) {
  const [openedItems, setOpenedItems] = useState([]);
  const [propsOpenedItems, setPropsOpenedItems] = useState([]);
  const [, forceUpdate] = React.useState(0); // hook like forceUpdate
  const itemPaddingLeft = 15;

  useEffect(() => {
    if (JSON.stringify(propsOpenedItems) !== JSON.stringify(props.openedItems)) {
      setPropsOpenedItems(props.openedItems);
      setOpenedItems(union(openedItems, props.openedItems));
    }
  }, [props.openedItems]);

  const stopPropagation = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  const handleClick = (e, item) => {
    stopPropagation(e);
    props.onClick(item);
  };

  const handleLoadChildren = async (e, item) => {
    stopPropagation(e);

    if (openedItems.includes(item._id)) {
      setOpenedItems(openedItems.filter((id) => id !== item._id));
    } else if (item.nodes && item.nodes.length) {
      setOpenedItems([...openedItems, item._id]);
    } else {
      setOpenedItems([...openedItems, item._id]);
      await props.onLoadChildren(item);
      forceUpdate((n) => !n);
    }
  };

  const isParentOfMovedCollection = (item, movedItem) => {
    if (!movedItem) return false;
    return item.nodes && item.nodes.some((node) => `${movedItem.path}${movedItem.name}` === `${node.path}${node.name}`);
  };

  const renderItem = (item, iconSpecial, level) => {
    if (item.hidden || item.deletedByTeammate) return null;
    const {
      collectionToMove,
      checkedItems,
      disableRoot,
      usePermissions,
      type,
      isFetching,
      fetchingId,
      disabledItems,
    } = props;
    const isChecked = checkedItems.includes(item._id);
    const isOpenedItems = openedItems.includes(item._id);
    const showArrow = item.hasChild || (item.nodes && !!item.nodes.length);
    const { permissions = {}, path } = item;
    const isRootDisabled = path === 'root' && disableRoot;
    let pathOfMovedCollection = '';
    if (collectionToMove) {
      pathOfMovedCollection = collectionToMove.path + collectionToMove.name;
    }

    let isDisabledByPermission = false;
    switch (type) {
    case 'attach': {
      isDisabledByPermission = permissions.editAssetCollections !== true;
      break;
    }

    case 'duplicate': {
      isDisabledByPermission = permissions.upload !== true;
      break;
    }

    case 'move': {
      isDisabledByPermission = permissions.moveCollections !== true;
      break;
    }

    default: {
      isDisabledByPermission = false;
      break;
    }
    }

    const itemClassName = cn('dropdownTreeItem', {
      act: isChecked,
      openedItem: isOpenedItems || isRootDisabled,
      disabled:
        (disabledItems?.length && disabledItems.includes(item._id))
        || ((usePermissions || isRootDisabled)
          && (isRootDisabled
            || (collectionToMove
              && (isParentOfMovedCollection(item, collectionToMove)
                || path.startsWith(pathOfMovedCollection)
                || (item.nodes && item.nodes.find((node) => node.name === collectionToMove.name))
                || (item.name === collectionToMove.name && path === collectionToMove.path)))
            || isDisabledByPermission)),
    });

    return (
      <div className={itemClassName} key={item._id}>
        <div
          className="row"
          onClick={(e) => handleClick(e, item)}
          style={{ paddingLeft: itemPaddingLeft * level }}
        >
          <If condition={showArrow}>
            <span className="arrowItem" role="button" onClick={(e) => handleLoadChildren(e, item)} />
          </If>
          <span className="iconSubject">
            <DropdownTreeIcon iconSpecial={iconSpecial} />
          </span>
          <If condition={isChecked}>
            <Icon name="ok" />
          </If>
          <span className="dropdownTreeItemName">{item.name}</span>
        </div>
        <If condition={isFetching && isOpenedItems && item._id === fetchingId}>
          <SkeletonItem itemPaddingLeft={itemPaddingLeft} level={level} iconSpecial={iconSpecial} />
        </If>
        <If condition={isOpenedItems || isRootDisabled}>
          <div className="childList">
            <If condition={item.isFetching}>
              <div className="dropdownTreeItem">
                <SkeletonItem itemPaddingLeft={itemPaddingLeft} level={level} iconSpecial={iconSpecial} />
              </div>
            </If>
            <If condition={!item.isFetching && item.nodes}>
              {item.nodes.map((node) => renderItem(node, iconSpecial, level + 1))}
            </If>
          </div>
        </If>
      </div>
    );
  };

  return (
    <div className="dropdownTreeWrapper">
      <div className="dropdownTree" onClick={stopPropagation}>
        <div className="dropdownTreeList">
          {props.treeListItems.map((item) => renderItem(item, props.iconSpecial, 1))}
        </div>
      </div>
    </div>
  );
}

/** default props */
DropdownTree.defaultProps = {
  disableRoot: false,
  disabledItems: null,
  usePermissions: true,
  collectionToMove: {},
  iconSpecial: 'folder',
  isFetching: false,
  fetchingId: '',
};

DropdownTree.propTypes = {
  onClick: PropTypes.func.isRequired,
  onLoadChildren: PropTypes.func.isRequired,
  checkedItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabledItems: PropTypes.arrayOf(PropTypes.string),
  collectionToMove: PropTypes.shape({
    path: PropTypes.string,
    name: PropTypes.string,
  }),
  disableRoot: PropTypes.bool,
  treeListItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  iconSpecial: PropTypes.string,
  type: PropTypes.string.isRequired,
  usePermissions: PropTypes.bool,
  isFetching: PropTypes.bool,
  fetchingId: PropTypes.string,
};
