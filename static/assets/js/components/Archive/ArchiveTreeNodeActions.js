import React from 'react';
import PropTypes from 'prop-types';
import { TreeItemAction, TreeItemActions } from '@picsio/ui';
import { Unarchive, Download, Delete } from '@picsio/ui/dist/icons';

const ArchiveTreeNodeActions = (props) => {
  const { permissions, collectionPermissions, archived, onRestore, onDownload, onDelete } = props;

  return (
    <TreeItemActions>
      <If condition={permissions.downloadArchive}>
        <TreeItemAction tooltip="Download collection" onClick={onDownload} size="md">
          <Download />
        </TreeItemAction>
      </If>
      <If condition={archived && permissions.manageArchive}>
        <>
          <TreeItemAction tooltip="Unarchive collection" onClick={onRestore}>
            <Unarchive />
          </TreeItemAction>
          <If condition={permissions.deleteArchive && collectionPermissions.deleteCollections}>
            <TreeItemAction tooltip="Remove collection" onClick={onDelete} size="md">
              <Delete />
            </TreeItemAction>
          </If>
        </>
      </If>
    </TreeItemActions>
  );
}

ArchiveTreeNodeActions.defaultProps = {
  permissions: {},
  collectionPermissions: {},
  archived: false,
};
ArchiveTreeNodeActions.propTypes = {
  collectionPermissions: PropTypes.shape({
    deleteCollections: PropTypes.bool,
  }),
  permissions: PropTypes.shape({
    manageArchive: PropTypes.bool,
    downloadArchive: PropTypes.bool,
    deleteArchive: PropTypes.bool,
  }),
  archived: PropTypes.bool,
  onRestore: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ArchiveTreeNodeActions;
