import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import Skeleton from 'react-loading-skeleton';
import {
  func, array, string, bool,
} from 'prop-types';
import { Button } from '@picsio/ui';
import localization from '../../shared/strings';
import ErrorBoundary from '../ErrorBoundary';
import Tag from '../Tag';
import DropdownTree, { DropdownTreeWithStore } from '../DropdownTree';
import DropdownTreeOpener from '../DropdownTreeOpener';
import { prepareSelectedCollections } from '../../store/helpers/collections';
import WithSkeletonTheme from '../WithSkeletonTheme';
import './styles.scss';

/** Store */
import store from '../../store';

/**
 * CollectionsList
 * @param {Object} props
 * @returns {JSX}
 */
export default function CollectionsList({
  selectedCollections = [],
  activeCollectionId,
  activeCollectionIds,
  handleToggleCollection,
  handleDetachCollection,
  handleClickCollection,
  handleClickSelectedAllCollection,
  rootRemovable,
  useStore,
  allCollections,
  handleLoadChildren,
  isFetching,
  fetchingId,
  placeholderForEmptyCollections,
  isLoading,
  isSelectAllCollections,
}) {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    if (collections.length === 0) {
      const collectionsStore = store.getState().collections;
      const collectionsFromStore = collectionsStore && collectionsStore.collections && collectionsStore.collections.my;
      const normalizedCollections = { ...collections };
      normalizedCollections.permissions = null;
      if (normalizedCollections.nodes && normalizedCollections.nodes.length) {
        normalizedCollections.nodes = normalizedCollections.nodes.map((collection) => {
          const collectionCopy = { ...collection };
          collectionCopy.permissions = null;
          return { ...collectionCopy };
        });
      }
      setCollections([collectionsFromStore]);
    }
  });

  if (!collections.length) return null;

  const rootId = collections[0]._id;
  selectedCollections = prepareSelectedCollections(
    allCollections || collections,
    selectedCollections,
  );
  const isCollectionSelected = (id) => activeCollectionId === id
    || (activeCollectionIds?.length && activeCollectionIds.includes(id));

  const selectedAll = () => {
    handleClickSelectedAllCollection(selectedCollections);
  };

  return (
    <ErrorBoundary>
      <div className="addCollection">
        <DropdownTreeOpener
          hideOnClickOutside
          tooltip={localization.OPEN_COLLECTIONS_DIALOG}
          isPermission
        >
          {useStore ? (
            <DropdownTreeWithStore
              disableRoot
              checkedItems={selectedCollections}
              onClick={handleToggleCollection}
              iconSpecial="folder"
              usePermissions={false}
              type="default"
            />
          ) : (
            <DropdownTree
              checkedItems={selectedCollections.map((collection) => collection._id)}
              openedItems={[rootId]}
              treeListItems={allCollections}
              onClick={handleToggleCollection}
              onLoadChildren={handleLoadChildren}
              iconSpecial="folder"
              isFetching={isFetching}
              fetchingId={fetchingId}
              usePermissions={false}
              type="default"
            />
          )}
        </DropdownTreeOpener>
        <If condition={isSelectAllCollections}>
          <Button
            className="sellectedAllCollection"
            onClick={selectedAll}
            color="primary"
          >
            Select all collections
          </Button>
        </If>
      </div>
      <div className="collectionsList">
        {(!selectedCollections.length && !placeholderForEmptyCollections) || isLoading ? (
          <WithSkeletonTheme>
            <Skeleton width={100} height={20} />
            <Skeleton width={120} height={20} />
            <Skeleton width={150} height={20} />
          </WithSkeletonTheme>
        ) : (
          selectedCollections.map((collection) => (
            <Tag
              type="collection"
              key={collection._id}
              text={collection.title}
              isCollection
              className={cn('tagLong', { act: isCollectionSelected(collection._id) })}
              onClick={(event) => handleClickCollection(collection, event)}
              title={collection.title}
              onClose={
                collection._id !== rootId || rootRemovable
                  ? (event) => handleDetachCollection(collection, event)
                  : null
              }
            />
          ))
        )}
        {Boolean(!selectedCollections.length && placeholderForEmptyCollections)
          && placeholderForEmptyCollections}
      </div>
    </ErrorBoundary>
  );
}

CollectionsList.defaultProps = {
  activeCollectionIds: [],
};

CollectionsList.propTypes = {
  selectedCollections: array,
  activeCollectionId: func,
  activeCollectionIds: array,
  handleToggleCollection: func,
  handleClickCollection: func,
  handleDetachCollection: func,
  handleClickSelectedAllCollection: func,
  rootRemovable: bool,
  useStore: bool,
  allCollections: array,
  isFetching: bool,
  fetchingId: string,
  placeholderForEmptyCollections: string,
  handleLoadChildren: func,
  isLoading: bool,
  isSelectAllCollections: bool,
};
