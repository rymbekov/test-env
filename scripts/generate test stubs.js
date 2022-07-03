const template = `
/*
This test stub is generated automatically .
Uncomment necessary lines and make test green.
*/
import React from 'react';
import { render } from '@testing-library/react';
// import %%COMPONENT_NAME%% from './%%COMPONENT_NAME%%';

describe('<%%COMPONENT_NAME%% />', () => {
  it('Should render', () => {
    // const { queryByText } = render(<%%COMPONENT_NAME%% />);
    // expect(queryByText('Component renders text!')).not.toBeNull();
    expect(true).not.toBeFalsy();
  });
});

`;

const paths = [
  'static/assets/js/components/Search/index.js',
  'static/assets/js/components/Creator/index.js',
  'static/assets/js/components/Home/index.js',
  'static/assets/js/components/dropdown/index.js',
  'static/assets/js/components/recursiveSearchPanel/index.js',
  'static/assets/js/components/ScreenTab/index.js',
  'static/assets/js/components/ScreenReferral/index.js',
  'static/assets/js/components/CollectionsList/index.js',
  'static/assets/js/components/WithSkeletonTheme/index.js',
  'static/assets/js/components/CollectionInfo/index.js',
  'static/assets/js/components/ErrorBoundary/index.js',
  'static/assets/js/components/Sort/index.js',
  'static/assets/js/components/ExportCsvDialog/index.js',
  'static/assets/js/components/revokeConsent/index.js',
  'static/assets/js/components/Editor/index.js',
  'static/assets/js/components/keywordsTreeOld/index.js',
  'static/assets/js/components/customFieldsSchema/index.js',
  'static/assets/js/components/lightboardsTree/index.js',
  'static/assets/js/components/details/index.js',
  'static/assets/js/components/SearchBar/index.js',
  'static/assets/js/components/NotificationSettings/index.js',
  'static/assets/js/components/ScreenCatalog/index.js',
  'static/assets/js/components/notificationPanel/index.js',
  'static/assets/js/components/spinner/index.js',
  'static/assets/js/components/SwitchAccountDialog/index.js',
  'static/assets/js/components/CustomFieldsSelector/index.js',
  'static/assets/js/components/AvatarGroup/index.js',
  'static/assets/js/components/CollectionsTree/index.js',
  'static/assets/js/components/Breadcrumbs/index.js',
  'static/assets/js/components/RevisionFieldsDialog/index.js',
  'static/assets/js/components/dialog/index.js',
  'static/assets/js/components/Opener/index.js',
  'static/assets/js/components/downloadDialog/index.js',
  'static/assets/js/components/map/index.js',
  'static/assets/js/components/Billing/index.js',
  'static/assets/js/components/TagList/index.js',
  'static/assets/js/components/keywordsDropdown/index.js',
  'static/assets/js/components/ScreenCatalogProofing/index.js',
  'static/assets/js/components/MapView/index.js',
  'static/assets/js/components/History/index.js',
  'static/assets/js/components/Shortcuts/index.js',
  'static/assets/js/components/Avatar/index.js',
  'static/assets/js/components/Compare/index.js',
  'static/assets/js/components/CustomFields/index.js',
  'static/assets/js/components/resolveDuplicatesDialog/index.js',
  'static/assets/js/components/UserComponent/index.js',
  'static/assets/js/components/restrictAccess/index.js',
  'static/assets/js/components/customFieldsSchemaEdit/index.js',
  'static/assets/js/components/teammates/index.js',
  'static/assets/js/components/toolbars/index.js',
  'static/assets/js/components/Icon/index.js',
  'static/assets/js/components/sync/index.js',
  'static/assets/js/components/Audit/index.js',
  'static/assets/js/components/dialogRadios/index.js',
  'static/assets/js/components/DeleteAccount/index.js',
  'static/assets/js/components/DownloadList/index.js',
  'static/assets/js/components/import/index.js',
  'static/assets/js/components/DropdownTree/index.js',
  'static/assets/js/components/Storage/index.js',
  'static/assets/js/components/Tag/index.js',
  'static/assets/js/components/Notifications/index.js',
  'static/assets/js/components/CatalogItem/index.js',
  'static/assets/js/components/screenSingleSharing/index.js',
  'static/assets/js/components/SelectFromTreeDialog/index.js',
  'static/assets/js/components/Websites/index.js',
  'static/assets/js/components/LoginForm/index.js',
  'static/assets/js/components/savedSearchesTree/index.js',
  'static/assets/js/components/LoginScreen/index.js',
  'static/assets/js/components/Analytics/index.js',
  'static/assets/js/components/InboxTree/index.js',
  'static/assets/js/components/ScreenInboxImport/index.js',
  'static/assets/js/components/ScreenInboxSettings/index.js',
  'static/assets/js/components/importInbox/index.js',
  'static/assets/js/components/TreePlaceholder/index.js',
  'static/assets/js/components/UpgradePlan/index.js',
  'static/assets/js/components/MobileTrees/index.js',
  'static/assets/js/components/ScreenPlanCancellation/index.js',
  'static/assets/js/components/ScreenPlanDowngrade/index.js',
  'static/assets/js/components/ScreenWarning/index.js',
  'static/assets/js/components/Warning/index.js',
  'static/assets/js/components/Account/index.js',
  'static/assets/js/components/AssigneesDropdown/index.js',
  'static/assets/js/components/confirmComponent/index.js',
  'static/assets/js/components/previewView/index.js',
  'static/assets/js/components/MobileAdditionalPanel/index.js',
  'static/assets/js/components/PersonalInfo/index.js',
  'static/assets/js/components/PullToRefresh/index.js',
  'static/assets/js/components/Swipeable/index.js',
  'static/assets/js/components/Toast/index.js',
  'static/assets/js/components/Wootric/index.js',
  'static/assets/js/components/Archive/index.js',
  'static/assets/js/components/CatalogView/index.js',
  'static/assets/js/components/Alert/index.js',
  'static/assets/js/components/AssetsLimitExceededDialog/index.js',
  'static/assets/js/components/MobileAppBanner/index.js',
  'static/assets/js/components/TwoFactorAuth/index.js',
  'static/assets/js/components/TwoFactorScreen/index.js',
];

const fs = require('fs');

paths.forEach((path) => {
  const folderPath = path.split('/').slice(0, -1).join('/');
  const folder = path.split('/').slice(0, -1).pop();
  const content = template.replace(/%%COMPONENT_NAME%%/ig, folder);
  fs.writeFileSync(`${folderPath}/${folder}.test.js`, content);
});
