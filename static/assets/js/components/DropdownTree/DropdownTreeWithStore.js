import React, { useState, useEffect } from 'react';

/** Store */
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import union from 'lodash.union';
import * as collectionsApi from '../../api/collections';
import store from '../../store';
import * as collectionsActions from '../../store/actions/collections';
import { findCollection, getParent } from '../../store/helpers/collections';
import DropdownTree from './DropdownTree';

const DropdownTreeWithStore = (props) => {
  const rootId = props.rootCollectionId || props.collectionsStore.collections.my._id;
  const [rootCollection, setRootCollectiond] = useState(null);
  const [openedItems, setOpenedItems] = useState([rootId]);
  const [fetchingCollectionsIds, setFetchingCollectionsIds] = useState([]);
  const [fetchingRootId, setFetchingRootId] = useState(null);

  useEffect(() => {
    if (props.collectionsStore.collections.my.isFetching) return;

    // get custom root collection, if props.rootCollectionId exists
    if (props.rootCollectionId && props.rootCollectionId !== props.collectionsStore.collections.my._id) {
      const storeCollections = props.collectionsStore.collections;
      const collection = findCollection(storeCollections, 'my', { _id: props.rootCollectionId });
      if (!collection) {
        const fetchCustomRootCollection = async (collection) => {
          setFetchingRootId(props.rootCollectionId);
          collection = await collectionsApi.getCollection(props.rootCollectionId);
          if (collection) {
            setRootCollectiond(collection);
          } else {
            setFetchingRootId(null);
          }
        };
        if (!fetchingRootId !== props.rootCollectionId) {
          fetchCustomRootCollection(collection);
        }
      } else {
        setRootCollectiond(collection);
      }
    }

    const findOpenedCollectionsIds = () => {
      const storeCollections = props.collectionsStore.collections;
      // Find parents collections Ids
      const parentsIds = [];
      props.checkedItems.forEach((collection) => {
        let foundCollection = findCollection(storeCollections, 'my', { _id: collection._id });
        if (!foundCollection && !fetchingCollectionsIds.includes(collection._id)) {
          setFetchingCollectionsIds([...fetchingCollectionsIds, collection._id]);
          // we pushing ids to fetchingCollectionsIds for fetching once
          // if we don't do it, this function loops in componentDidUpdate
          props.collectionsActions.getChildren(props.collectionsStore.collections.my._id, {
            currentCollectionId: collection._id,
          });
        } else if (foundCollection) {
          setFetchingCollectionsIds([...fetchingCollectionsIds.filter((id) => id !== collection._id)]);
          while (foundCollection) {
            foundCollection = getParent(storeCollections, 'my', { _id: foundCollection._id });
            if (foundCollection) {
              parentsIds.push(foundCollection._id);
            }
          }
        }
      });
      const uniqueIds = union(parentsIds);
      if (uniqueIds !== openedItems) {
        setOpenedItems(uniqueIds);
      }
    };

    findOpenedCollectionsIds();
  }, [props.collectionsStore.collections.my.nodes]);

  if (props.rootCollectionId && !rootCollection) {
    return null;
  }

  return (
    <DropdownTree
      treeListItems={[props.rootCollectionId ? rootCollection : props.collectionsStore.collections.my]}
      checkedItems={props.checkedItems.map(
        (item) => (typeof item === 'string' ? item : item._id),
      ) || []}
      openedItems={openedItems}
      disableRoot={props.disableRoot}
      onClick={props.onClick}
      onLoadChildren={(item) => props.collectionsActions.getChildren(item._id)}
      iconSpecial={props.iconSpecial || 'folder'}
      usePermissions={props.usePermissions}
      type={props.type}
    />
  );
};

const ConnectedDropdownTreeWithStore = connect(
  (state) => ({
    collectionsStore: state.collections,
  }),
  (dispatch) => ({
    collectionsActions: bindActionCreators(collectionsActions, dispatch),
  }),
)(DropdownTreeWithStore);

export default (props) => (
  <Provider store={store}>
    <ConnectedDropdownTreeWithStore {...props} />
  </Provider>
);
