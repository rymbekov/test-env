import { permissions } from '@picsio/db/src/constants';
import localization from '../../../shared/strings';

export const DEFAULT_PERMISSIONS = {
  [permissions.createCollections]: false,
  [permissions.moveCollections]: false,
  [permissions.editCollections]: false,
  [permissions.deleteCollections]: false,
  [permissions.upload]: false,
  [permissions.websites]: false,
  [permissions.downloadFiles]: false,
  [permissions.allowEditor]: false,
  [permissions.deleteAssets]: false,
  [permissions.approveAssets]: false,
  [permissions.editAssetFilename]: false,
  [permissions.editAssetTitle]: false,
  [permissions.editAssetDescription]: false,
  [permissions.editAssetKeywords]: false,
  [permissions.autogenerateKeywords]: false,
  [permissions.editAssetCollections]: false,
  [permissions.editAssetAssignees]: false,
  [permissions.editAssetLinkedAssets]: false,
  [permissions.editAssetMarks]: false,
  [permissions.editAssetMetadata]: false,
  [permissions.manageAssetWatermark]: false,
  [permissions.downloadWithoutWatermark]: false,
};

const COLLECTION_PERMISSIONS = [
  // COLLECTIONS
  {
    title: 'Collections',
    name: 'groupCollections',
    children: [
      {
        title: 'Create',
        name: permissions.createCollections,
        description: localization.TEAMMATES.permissionTitleCollectionsCreate,
      },
      {
        title: 'Move',
        name: permissions.moveCollections,
        description: localization.TEAMMATES.permissionTitleCollectionsMove,
      },
      {
        title: 'Rename',
        name: permissions.editCollections,
        description: localization.TEAMMATES.permissionTitleCollectionsEdit,
      },
      {
        title: 'Delete',
        name: permissions.deleteCollections,
        description: localization.TEAMMATES.permissionTitleCollectionsDelete,
      },
    ],
  },
  // ASSETS
  {
    title: 'Assets',
    name: 'groupAssets',
    children: [
      {
        title: 'Upload',
        name: permissions.upload,
        description: localization.TEAMMATES.permissionTitleUpload,
      },
      {
        title: 'Share',
        name: permissions.websites,
        description: localization.TEAMMATES.permissionTitleWebsites,
      },
      {
        title: 'Download',
        name: permissions.downloadFiles,
        description: 'Download an asset to a device',
      },
      {
        title: 'Edit',
        name: permissions.allowEditor,
        description: 'Open an asset in a browser photo/image editor',
      },
      {
        title: 'Delete',
        name: permissions.deleteAssets,
        description: 'Permanently delete an asset from library',
      },
      {
        title: 'Approve',
        name: permissions.approveAssets,
        description: localization.TEAMMATES.permissionTitleApproveAssets,
      },
      {
        title: 'Asset attributes',
        name: 'groupMetadata',
        children: [
          {
            title: 'Change filename',
            name: permissions.editAssetFilename,
            description: localization.TEAMMATES.permissionDescrEditAssetFilename,
          },
          {
            title: 'Change title',
            name: permissions.editAssetTitle,
            description: localization.TEAMMATES.permissionDescrEditAssetTitle,
          },
          {
            title: 'Change description',
            name: permissions.editAssetDescription,
            description: localization.TEAMMATES.permissionDescrEditAssetDescription,
          },
          {
            title: 'Add keywords',
            name: permissions.editAssetKeywords,
            description: localization.TEAMMATES.permissionDescrEditAssetKeywords,
          },
          {
            // this option has specific relationship with its parent
            // when parent unchecked, this option also should be unchecked and disabled
            title: 'Generate AI keywords',
            name: permissions.autogenerateKeywords,
            description: localization.TEAMMATES.permissionDescrAutogenerateKeywords,
          },
          {
            title: 'Attach to collections',
            name: permissions.editAssetCollections,
            description: localization.TEAMMATES.permissionDescrEditAssetCollections,
          },
          {
            title: 'Assign to teammates',
            name: permissions.editAssetAssignees,
            description: localization.TEAMMATES.permissionDescrEditAssetAssignees,
          },
          {
            title: 'Link to other assets',
            name: permissions.editAssetLinkedAssets,
            description: localization.TEAMMATES.permissionDescrEditAssetLinkedAssets,
          },
          {
            title: 'Change a flag, color, labels, star ratings',
            name: permissions.editAssetMarks,
            description: localization.TEAMMATES.permissionDescrEditAssetMarks,
          },
          {
            title: 'Change custom fields',
            name: permissions.editAssetMetadata,
            description: localization.TEAMMATES.permissionDescrEditAssetMetadata,
          },
        ]
      },
    ],
  },

  // WATERMARKS
  {
    title: 'Watermarks',
    name: 'groupWatermarks',
    children: [
      {
        title: 'Apply and remove',
        name: permissions.manageAssetWatermark,
        description: 'Lay a watermark over an asset and remove it',
      },
      {
        title: 'Download without watermark',
        name: permissions.downloadWithoutWatermark,
        description: 'Download an asset with/without a watermark laid over',
      },
    ],
  },
];

export default COLLECTION_PERMISSIONS;
