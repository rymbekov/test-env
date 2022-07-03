import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import KeywordsTree from './KeywordsTree';
import Search from './KeywordsTreeSearch';
import sortItems from './sortItems';
import picsioConfig from '../../../../../config';
import showDropAssetsOnlyDialog from '../../helpers/showDropAssetsOnlyDialog';
import Spinner from '../collectionsTree/views/Spinner';
import propTypes from './propTypes';

import TreePlaceholder from '../TreePlaceholder';
import TreePlaceholderError from '../TreePlaceholderError';
import localization from '../../shared/strings';

const KeywordsView = (props) => {
  const {
    activeKeywords,
    selectedKeywords,
    addItem,
    allNodes,
    deleteItem,
    deleteItems,
    mergeItems,
    handleDrop,
    isLoaded,
    isLoading,
    panelWidth,
    renameItem,
    resizePanelWidth,
    searchItems,
    searchQuery,
    setSelectedItems,
    selectItem,
    deselectItem,
    setSort,
    sortType,
    toggleFavoriteItem,
    keywordsTree,
    keywordsFavoritesTree,
    rolePermissions,
    isKeywordsActionsAllowed,
    isAddKeywordsOutsideVocabulary,
    isBusy,
    error,
    getKeywords,
  } = props;

  const draggableNodeId = useRef(null);

  const onDragStart = useCallback((event, nodeId) => {
    event.dataTransfer.setData('text/plain', picsioConfig.DRAG_KEYWORD_EVENT_CONTENT); // neccessary
    draggableNodeId.current = nodeId;
    const handleDragEnd = () => {
      draggableNodeId.current = null;
      document.removeEventListener('drop', handleDragEnd);
    };
    document.addEventListener('drop', handleDragEnd);
  }, []);

  const onDrop = useCallback((event, nodeId) => {
    if (
      event.dataTransfer.getData('text/plain') !== picsioConfig.DRAG_ASSETS_EVENT_CONTENT
      && event.dataTransfer.getData('text/plain') !== picsioConfig.DRAG_KEYWORD_EVENT_CONTENT
    ) {
      return showDropAssetsOnlyDialog();
    }

    return handleDrop(draggableNodeId.current, nodeId);
  }, [handleDrop, draggableNodeId]);

  const handleAddItem = useCallback((name) => {
    addItem('keywords', name);
  }, [addItem]);

  const isEmpty = isLoaded && !allNodes?.length;

  return (
    <div className="tree">
      <div style={{ width: panelWidth }} className="folderTreeView">
        <div className="treeResizer" onMouseDown={resizePanelWidth} role="presentation" />
        <Choose>
          <When condition={!isLoaded || (!isLoaded && error)}>
            <Choose>
              <When condition={!isLoaded}>
                <div className="treeList listFolderTree">
                  <Spinner />
                </div>
              </When>
              <Otherwise>
                <TreePlaceholderError
                  buttonId="getKeywords"
                  title={localization.KEYWORDSTREE.title}
                  description="Failed to load keywords. Click the button below to try again."
                  icon="placeholderKeyword"
                  handleClick={getKeywords}
                  isBusy={!isLoaded && !error}
                  buttonText="Load keywords"
                />
              </Otherwise>
            </Choose>
          </When>
          <Otherwise>
            <>
              <Search
                query={searchQuery}
                handleSearch={searchItems}
                sortType={sortType}
                setSort={setSort}
                sortItems={sortItems}
              />
              <Choose>
                <When condition={!isEmpty}>
                  <div className="listFolderTree">
                    <If condition={keywordsFavoritesTree[0]?.nodes?.length}>
                      <KeywordsTree
                        loading={isLoading}
                        allNodes={allNodes}
                        treeNodes={keywordsFavoritesTree}
                        activeIds={activeKeywords}
                        selectedKeywords={selectedKeywords}
                        addItem={addItem}
                        deleteItem={deleteItem}
                        renameItem={renameItem}
                        toggleFavoriteItem={toggleFavoriteItem}
                        onDragStart={onDragStart}
                        onDrop={onDrop}
                        rolePermissions={rolePermissions}
                        isKeywordsActionsAllowed={isKeywordsActionsAllowed}
                        isAddKeywordsOutsideVocabulary={isAddKeywordsOutsideVocabulary}
                      />
                    </If>
                    <If condition={keywordsTree.length}>
                      <KeywordsTree
                        isFiltered={!!searchQuery}
                        loading={isLoading}
                        allNodes={allNodes}
                        treeNodes={keywordsTree}
                        activeIds={activeKeywords}
                        selectedKeywords={selectedKeywords}
                        addItem={addItem}
                        deleteItem={deleteItem}
                        deleteItems={deleteItems}
                        renameItem={renameItem}
                        toggleFavoriteItem={toggleFavoriteItem}
                        onDragStart={onDragStart}
                        onDrop={onDrop}
                        selectItems={setSelectedItems}
                        selectItem={selectItem}
                        deselectItem={deselectItem}
                        mergeItems={mergeItems}
                        rolePermissions={rolePermissions}
                        isKeywordsActionsAllowed={isKeywordsActionsAllowed}
                        isAddKeywordsOutsideVocabulary={isAddKeywordsOutsideVocabulary}
                      />
                    </If>
                  </div>
                </When>
                <Otherwise>
                  <TreePlaceholder
                    buttonId="createKeyword"
                    title={localization.KEYWORDSTREE.title}
                    description={localization.KEYWORDSTREE.textPlaceholderText}
                    icon="placeholderKeyword"
                    add={handleAddItem}
                    error={error || true}
                    isBusy={isBusy}
                    isActionsAllowed={isKeywordsActionsAllowed || isAddKeywordsOutsideVocabulary}
                  />
                </Otherwise>
              </Choose>
            </>
          </Otherwise>
        </Choose>
      </div>
    </div>
  );
};

KeywordsView.defaultProps = {
  allNodes: [],
  error: null,
};
KeywordsView.propTypes = {
  activeKeywords: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedKeywords: PropTypes.arrayOf(PropTypes.string).isRequired,
  addItem: PropTypes.func.isRequired,
  allNodes: PropTypes.arrayOf(PropTypes.shape(propTypes.keyword)),
  deleteItem: PropTypes.func.isRequired,
  deleteItems: PropTypes.func.isRequired,
  mergeItems: PropTypes.func.isRequired,
  handleDrop: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isBusy: PropTypes.bool.isRequired,
  error: PropTypes.string,
  panelWidth: PropTypes.number.isRequired,
  renameItem: PropTypes.func.isRequired,
  resizePanelWidth: PropTypes.func.isRequired,
  searchItems: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSelectedItems: PropTypes.func.isRequired,
  selectItem: PropTypes.func.isRequired,
  deselectItem: PropTypes.func.isRequired,
  setSort: PropTypes.func.isRequired,
  sortType: PropTypes.shape(propTypes.sortType).isRequired,
  toggleFavoriteItem: PropTypes.func.isRequired,
  rolePermissions: PropTypes.shape(propTypes.bool).isRequired,
  isKeywordsActionsAllowed: PropTypes.bool.isRequired,
  isAddKeywordsOutsideVocabulary: PropTypes.bool.isRequired,
  getKeywords: PropTypes.func.isRequired,
};

export default KeywordsView;
