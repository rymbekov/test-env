import React, { memo, useState, useEffect, useCallback } from 'react';
import { useMount, usePrevious } from 'react-use';
import PropTypes from 'prop-types';
import { Tree } from '@picsio/ui';
import { useSelector, useDispatch } from 'react-redux';

import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';

import ArchiveTreeNode from './ArchiveTreeNode';
import propTypes from './propTypes';
import archiveActions from '../../store/actions/archive';

import { findCollectionsPathToId } from '../../store/actions/helpers/archive';
import { setSearchRoute } from '../../helpers/history';

const ArchiveTree = (props) => {
  const dispatch = useDispatch();
  const {
    loading,
    user,
    activeCollectionId,
    collections,
    added,
    deleted,
    fetchMoreCollections,
    unarchiveCollection,
    downloadCollection,
    deleteCollection,
  } = props;
  const searchQuery = useSelector((state) => state.router.location.query);
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState(null);
  const prevLoading = usePrevious(loading);
  const prevSearchQuery = usePrevious(searchQuery);
  const rootCollectionId = collections.length && collections[0]._id;
  const isArchiveOpened = utils.LocalStorage.get('picsio.tagsTree.archive.open');
  const isOpenPreviously = isArchiveOpened === null ? true : isArchiveOpened;

  useMount(() => {
    const { tagId, archived } = searchQuery;

    if (tagId && archived) {
      const { path } = findCollectionsPathToId(collections, tagId);

      setExpanded(path);
      setSelected(tagId);
    } else if (isOpenPreviously && collections[0].children && collections[0].children.length) {
      setExpanded([collections[0]._id]);
    } else if (isOpenPreviously && collections[0] && !collections[0].children) {
      // Load archive collections when Archive tree opened at first
      dispatch(archiveActions.fetchArchivedCollections({ collectionId: collections[0]._id }));
    }
  });

  useEffect(() => {
    if (isOpenPreviously && expanded.length === 0) {
      if (collections[0].children && collections[0].children.length && selected) {
        const { path } = findCollectionsPathToId(collections, selected);
        setExpanded(path);
      } else {
        setExpanded([collections[0]._id]);
      }
    }
    if (prevLoading && !loading) {
      const { path } = findCollectionsPathToId(collections, selected);

      setExpanded(path);
    }

    if (prevSearchQuery !== searchQuery) {
      const { tagId, archived } = searchQuery;
      if (archived) {
        setSelected(tagId);
      }
    }
  }, [prevLoading, loading, selected, collections, expanded, searchQuery]);

  useEffect(() => {
    if (activeCollectionId !== selected) {
      setSelected(activeCollectionId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCollectionId]);

  const onNodeToggle = useCallback((event, { nodeId }) => {
    setExpanded((prevExpanded) => {
      const isExist = prevExpanded.includes(nodeId);

      if (nodeId === rootCollectionId) {
        utils.LocalStorage.set('picsio.tagsTree.archive.open', !isExist);
      }
      if (isExist) {
        return prevExpanded.filter(id => id !== nodeId);
      }
      return [...prevExpanded, nodeId];
    });
  }, [rootCollectionId]);

  const onNodeSelect = useCallback((event, { nodeId }) => {
    Logger.log('User', 'ArchivedCollectionSelected', { collectionId: nodeId });

    setSearchRoute({ tagId: nodeId, archived: true });
  }, []);

  const renderNode = useCallback(
    (args) => {
      const { children, nodeId, node, path, isOpen, isSelected, onToggle, onSelect } = args;
      const level = path.length;
      const isAdded = added.includes(nodeId);
      const isDeleted = deleted.includes(nodeId);

      return (
        <ArchiveTreeNode
          key={nodeId}
          nodeId={nodeId}
          node={node}
          level={level}
          isOpen={isOpen}
          isSelected={isSelected}
          isAdded={isAdded}
          isDeleted={isDeleted}
          onToggle={onToggle}
          onSelect={onSelect}
          user={user}
          fetchMore={fetchMoreCollections}
          unarchiveCollection={unarchiveCollection}
          downloadCollection={downloadCollection}
          deleteCollection={deleteCollection}
        >
          {children}
        </ArchiveTreeNode>
      );
    },
    [user, added, deleted, fetchMoreCollections, unarchiveCollection, downloadCollection, deleteCollection]
  );

  return (
    <Tree
      className="archiveTree"
      nodes={collections}
      renderNode={renderNode}
      onNodeToggle={onNodeToggle}
      onNodeSelect={onNodeSelect}
      expanded={expanded}
      selected={selected}
      childKey="children"
      controlled
    />
  );
};

ArchiveTree.defaultProps = {
  loading: false,
  activeCollectionId: null,
  collections: [],
  added: [],
  deleted: [],
};
ArchiveTree.propTypes = {
  loading: PropTypes.bool,
  user: PropTypes.shape(propTypes.user).isRequired,
  activeCollectionId: PropTypes.string,
  collections: PropTypes.arrayOf(PropTypes.shape(propTypes.collection)),
  added: PropTypes.arrayOf(PropTypes.string),
  deleted: PropTypes.arrayOf(PropTypes.string),
  fetchMoreCollections: PropTypes.func.isRequired,
  unarchiveCollection: PropTypes.func.isRequired,
  downloadCollection: PropTypes.func.isRequired,
  deleteCollection: PropTypes.func.isRequired,
};

export default memo(ArchiveTree);
