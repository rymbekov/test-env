import { permissions } from '@picsio/db/src/constants';
import localization from '../../../shared/strings';

//! ! TODO move config to picsio-db and use the same for server and front
const ROLE_PERMISSIONS = [
  {
    title: 'Teammates',
    name: permissions.manageTeam,
    description: localization.TEAMMATES.permissionTitleManageTeam,
  },
  {
    title: 'Billing',
    name: permissions.manageBilling,
    description: localization.TEAMMATES.permissionTitleManageBilling,
  },
  {
    title: 'Integrations',
    name: permissions.manageIntegrations,
    description: localization.TEAMMATES.permissionTitleManageIntegrations,
  },
  {
    title: 'Sync',
    name: permissions.sync,
    description: 'Run a sync process for the storage',
  },
  {
    title: 'Storage',
    name: permissions.manageStorage,
    description: 'Manage and change a connection to storage',
  },
  {
    title: 'Audit trail',
    name: permissions.accessAuditTrail,
    description: 'See a lof of actions of all teammates',
  },
  {
    title: 'Inboxes',
    name: permissions.manageInboxes,
    description: 'Create, configure and delete an inbox',
  },
  {
    title: 'Watermarks',
    name: permissions.manageWatermarks,
    description: 'Create, edit, delete watermarks',
  },
  {
    title: 'Keywords',
    name: permissions.manageKeywords,
    description: 'Create, edit or remove keywords & upload controlled vocabulary',
  },
  {
    title: 'Team saved searches',
    name: permissions.manageTeamSavedSearches,
    description: 'Add or remove saved searches for the team',
  },
  {
    title: 'Custom fields',
    name: permissions.editCustomFieldsSchema,
    description: 'Create, remove or edit custom fields',
  },
  {
    title: localization.TEAMMATES.permissionTitleImportCsv,
    name: permissions.importCSV,
    description: 'Upload a CSV file with metadata to update assets',
  },
  {
    title: localization.TEAMMATES.permissionTitleAddKeywords,
    name: permissions.addKeywordsOutsideVocabulary,
    description: localization.TEAMMATES.permissionDescrAddKeywords,
  },

  // Restricted
  {
    title: 'Restricted assets',
    name: 'restrict',
    children: [
      {
        title: 'Set as restricted',
        name: permissions.manageAssetRestrictSettings,
        description: 'Set/remove restriction status for assets',
      },
      {
        title: 'Download',
        description: 'Download restricted assets from Pics.io and share them outside',
        name: permissions.restrictedDownload,
      },
      {
        title: 'Approve/disapprove',
        name: permissions.restrictedApprove,
        description: 'Mark restricted asset revision as approved/disapproved',
      },
      {
        title: 'Change metadata',
        name: permissions.restrictedChangeMetadata,
        description: 'Change metadata/keywords for restricted assets',
      },
      {
        title: 'Attach/detach form collections',
        name: permissions.restrictedMoveOrDelete,
        description: 'Attach/detach restricted assets to/from collections and delete assets from Pics.io library',
      },
    ],
  },

  // Archived
  {
    title: 'Archive',
    name: 'archive',
    children: [
      {
        title: 'Archive asset/collection',
        name: 'viewArchive',
        description: 'Put an assets/collection to the archive',
      },
      {
        title: 'View archive',
        name: 'manageArchive',
        description: 'Open the archive and see assets in there',
      },
      {
        title: 'Download archived assets and collections',
        name: 'downloadArchive',
        description: 'Download archied assets/collection to a device',
      },
      {
        title: 'Delete archived assets and collections',
        name: 'deleteArchive',
        description: 'Delete archived asset/collection permanently from the archive',
      },
    ],
  },

  {
    title: 'Manage Lightboards',
    name: permissions.manageLightboards,
    description: 'Work with assets in private lightboards, upload in there, move assets from public collections to private lightboards',
  },
];

export default ROLE_PERMISSIONS;
