import React from 'react';
import { func, array, string } from 'prop-types';
import PermissionsChecker from '@picsio/db/src/helpers/PermissionsChecker';
import CONSTANTS from '@picsio/db/src/constants';
import Tag from '../../Tag';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import { setSearchRoute } from '../../../helpers/history';

class Collections extends React.Component {
  checker = new PermissionsChecker(this.props.userRole);

  editCollectionPermission = CONSTANTS.permissions.editAssetCollections;

  pathPrefix = CONSTANTS.ROOT_COLLECTION_PATH + CONSTANTS.PATH_DELIMITER;

  handleClick = (collectionID) => {
    const { changeTree, openedTree, isArchived } = this.props;

    if (isArchived) {
      setSearchRoute({ tagId: collectionID, archived: true });
      if (changeTree && openedTree !== 'archive') {
        changeTree('archive', true);
      }
    } else {
      setSearchRoute({ tagId: collectionID });
      if (changeTree && openedTree !== 'collections') {
        changeTree('collections', true);
      }
    }
  };

  removeCollection = (event, collection) => {
    const { props } = this;
    event.stopPropagation();
    Logger.log('User', 'InfoPanelRemoveCollection', { collectionId: collection._id });
    props.remove(collection, props.selectedAssets);
  };

  render() {
    const { props } = this;
    const { selectedAssets } = props;
    const placeholderText = selectedAssets.length > 1
      ? localization.DETAILS.panelPlaceholderAssetsNoCollections
      : localization.DETAILS.panelPlaceholderAssetNoCollections;

    return props.collections.length > 0 ? (
      <div
        onAnimationEnd={() => props.highlightAnimationReset('collections')}
        className={props.highlight.includes('collections') ? 'highlightBlink' : ''}
      >
        {props.collections.map((collection) => {
          const showRemoveButton = this.checker.checkPermissionByPath(
            this.editCollectionPermission,
            `${this.pathPrefix}${collection.path}`,
          );
          return (
            <Tag
              type="collection"
              key={collection.path}
              text={collection.path}
              tooltipText={collection.path}
              onClick={() => this.handleClick(collection._id)}
              onClose={
                !props.disabled && showRemoveButton
                  ? (event) => this.removeCollection(event, collection)
                  : null
              }
            />
          );
        })}
      </div>
    ) : (
      <div className="detailsPanel__placeholder">{placeholderText}</div>
    );
  }
}

Collections.propTypes = {
  collections: array,
  remove: func,
  selectedAssets: array,
  highlight: array,
  highlightAnimationReset: func,
  openedTree: string,
  changeTree: func,
};

export default Collections;
