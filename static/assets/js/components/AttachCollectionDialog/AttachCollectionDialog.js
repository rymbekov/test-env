import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import uniq from 'lodash.uniq';
import uniqBy from 'lodash.uniqby';
import PropTypes from 'prop-types';
import cn from 'classnames';
import DropdownTree from '../DropdownTree';
import Icon from '../Icon';
import * as collectionsActions from '../../store/actions/collections';
import * as assetsActions from '../../store/actions/assets';
import { findCollection, getParent } from '../../store/helpers/collections';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';

const fetchingCollectionsIds = [];

const AttachCollectionDialog = (props) => {
  const dispatch = useDispatch();

  const {
    selectedAssetsIds,
    title,
    style,
    onClose,
    destroy,
    textBtnOk,
    textBtnCancel,
    closeOnToggle,
  } = props;

  const { collections } = useSelector((state) => state.collections);
  const { items: assets } = useSelector((state) => state.assets);
  const [openedItems, setOpenedItems] = useState([collections.my._id]);
  const [attachedCollectionsIds, setAttachedCollectionsIds] = useState([]);

  const handleClose = () => {
    onClose();
    destroy();
  };

  useEffect(() => {
    /** @param {KeyboardEvent} event */
    // eslint-disable-next-line consistent-return
    const keyListener = (event) => {
      // eslint-disable-next-line default-case
      switch (event.key) {
      case 'Enter':
        return handleClose();
      case 'Escape':
        return handleClose();
      }
    };

    window.addEventListener('keydown', keyListener);
    return () => {
      window.removeEventListener('keydown', keyListener);
    };
  });

  useEffect(() => {
    const selectedAssets = assets.filter((asset) => selectedAssetsIds.includes(asset._id));
    let tags = [];
    if (selectedAssets.length) {
      selectedAssets.forEach((asset) => {
        const assetCollections = asset.tags;
        if (assetCollections) tags = [...tags, ...assetCollections];
      });
      if (tags.length) {
        tags = uniqBy(tags, '_id');
        const ids = tags.map((i) => i._id);
        setAttachedCollectionsIds(ids);
      }
    } else {
      // close Dialog when assets detached from opened collection
      handleClose();
    }
  }, [assets, selectedAssetsIds]);

  useEffect(() => {
    const findOpenedCollectionsIds = (ids) => {
      // Find parents collections Ids
      const parentsIds = [];
      ids.forEach((attachedCollectionId) => {
        let foundCollection = findCollection(collections, 'my', { _id: attachedCollectionId });
        if (!foundCollection && !fetchingCollectionsIds.includes(attachedCollectionId)) {
          // we pushing ids to fetchingCollectionsIds for fetching once
          // if we don't do it, this function loops in componentDidUpdate
          fetchingCollectionsIds.push(attachedCollectionId);
          dispatch(collectionsActions.getChildren(
            collections.my._id,
            { currentCollectionId: attachedCollectionId },
          ));
        } else if (foundCollection) {
          const index = fetchingCollectionsIds.findIndex((id) => id === attachedCollectionId);
          if (index > -1) {
            // if we found collection, we remove collection id from fetching queue
            fetchingCollectionsIds.splice(index, 1);
          }
          while (foundCollection) {
            foundCollection = getParent(collections, 'my', { _id: foundCollection._id });
            if (foundCollection) {
              parentsIds.push(foundCollection._id);
            }
          }
        }
      });

      const uniqIds = uniq(parentsIds);
      setOpenedItems(uniqIds);
    };

    findOpenedCollectionsIds(attachedCollectionsIds);
  }, [attachedCollectionsIds, collections, dispatch]);

  const removeCollection = (collection) => {
    Logger.log('User', 'AttachCollectionDialogRemoveCollection');
    dispatch(assetsActions.removeFromCollection(collection, selectedAssetsIds, true));
  };

  const handleToggleCollection = (collection) => {
    const clonnedCollection = { ...collection };
    clonnedCollection.path = (clonnedCollection.path + clonnedCollection.name).substring(1);
    if (!attachedCollectionsIds.includes(clonnedCollection._id)) {
      Logger.log('User', 'AttachCollectionDialogAddCollection', { collectionId: collection._id });

      dispatch(assetsActions.addToCollection({
        collectionID: clonnedCollection._id,
        collectionPath: clonnedCollection.path,
        assetIDs: selectedAssetsIds,
        withoutAlertDialog: true,
        isMove: closeOnToggle,
      }));
    } else {
      removeCollection(clonnedCollection);
    }

    if (closeOnToggle) {
      handleClose();
    }
  };

  return (
    <div className="simpleDialog moveCollectionDialog">
      <div className="simpleDialogUnderlayer" />
      <div className="simpleDialogBox" style={style}>
        <div className="simpleDialogHeader">
          <span className="simpleDialogTitle">
            {title}
          </span>
          <span className="simpleDialogBtnCross" onClick={handleClose}>
            <Icon name="close" />
          </span>
        </div>
        <div className="simpleDialogContent">
          <div className="simpleDialogContentInner">
            <DropdownTree
              checkedItems={attachedCollectionsIds}
              openedItems={openedItems}
              treeListItems={[collections.my]}
              onClick={handleToggleCollection}
              onLoadChildren={(item) => dispatch(collectionsActions.getChildren(item._id))}
              iconSpecial="folder"
              disableRoot
              type="attach"
            />
          </div>
        </div>
        <div className="simpleDialogFooter">
          {textBtnCancel !== null && (
            <span className="simpleDialogFooterBtn simpleDialogFooterBtnCancel" onClick={handleClose}>
              {textBtnCancel}
            </span>
          )}
          {textBtnOk !== null && (
            <span
              className={cn('simpleDialogFooterBtn', { disabled: attachedCollectionsIds.length === 0 })}
              onClick={handleOk}
            >
              {textBtnOk}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/** Prop types */
AttachCollectionDialog.propTypes = {
  selectedAssetsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  treeListItems: PropTypes.array,
  onLoadChildren: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  style: PropTypes.object,
  textBtnOk: PropTypes.string,
  textBtnCancel: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  destroy: PropTypes.func,
  collectionToMove: PropTypes.object,
  closeOnToggle: PropTypes.bool,
};

/** Default props */
AttachCollectionDialog.defaultProps = {
  title: '',
  style: {},
  onOk: () => {},
  onClose: () => {},
  destroy: () => {},
  textBtnOk: null,
  textBtnCancel: localization.DIALOGS.btnOk,
  collectionToMove: {},
  closeOnToggle: false,
};

export default AttachCollectionDialog;
