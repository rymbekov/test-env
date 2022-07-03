import React from 'react';
import pluralize from 'pluralize';
import Tag from '../components/Tag';

const getStorageTitle = (storageName) => {
  if (storageName === 'gd') {
    return 'Google Drive';
  }

  if (storageName === 's3') {
    return 'Amazon S3';
  }

  return 'Pics.io Storage';
};

const getTextErrorGDOne = (onClick) => (
  <>
    <p>
      You have a limited access to this file in Google Drive,
      which means you can't rename this asset in Picsio either.
    </p>
    <p>
      Tired of these limitations from Google Drive? Switch to
      <span aria-label="link to storage" className="dialogLink" onClick={onClick}> Picsio storage</span>.
    </p>
  </>
);

const getTextErrorGDBulk = (onClick) => (
  <>
    <p>
      Tired of these limitations from Google Drive? Switch to
      <span aria-label="link to storage" className="dialogLink" onClick={onClick}> Picsio storage</span>.
    </p>
  </>
);

export default {
  OPEN_COLLECTIONS_DIALOG: 'Open collections dialog',
  APP_START: {
    ERROR_WORKINGFOLDER_ADMIN:
      'Pics.io cannot access the working folder within the cloud storage associated with your account. Please make sure it is still accessible and hasn’t been deleted. You’re welcome to contact support@pics.io if you need any help from our side.',
    ERROR_WORKINGFOLDER_TEAMMATE:
      'Pics.io cannot access your account storage. Please contact your {txtAdminsList} about the issue. You’re also welcome to contact support@pics.io if you need any help from our side.',
    ERROR_CONNECTING_GDRIVE:
      'Pics.io cannot access your cloud storage. Please make sure it’s accessible (e.g. check your billing status) and refresh the page. If the error persists, contact us at support@pics.io.',
    ERROR_LOADING_USERDATA:
      'Sorry, Pics.io couldn’t load some data from your user profile. Please try to refresh the page. If the problem persists, contact us at support@pics.io',
    DEFAULT_ERROR:
      "Can't start Pics.io application. Please try to refresh the page. If the problem persists contact us at support@pics.io",
  },
  STORAGE_FOLDER_NOT_FOUND: 'Picsio folder not found',
  STORAGE_FILES_NOT_FOUND: 'Picsio folder is empty',
  STORAGE_CANT_TRASH_FILE: "Can't trash file",
  DISCLAIMER_PATTERN:
    "<b>Hold up there, %name%.</b><br/><br/>You’re getting access to the really early version of Pics.io.<br/><br/><b>It's an alpha.</b><br/><br/>I bet you've got it - it doesn't work more often than it works. Sometimes it delivers weird results only Andy Warhol would be satisfied.<br/><br/>We are big fans of rapid delivery so you will see small changes almost every day. Please let me know if you see that something goes wrong using our Helpdesk, Twitter or email.<br/><br/>Love,<br/>Vlad from TopTechPhoto",
  STORAGE_GDRIVE_NOT_CONNECTED:
    'Looks like your <b>Pics.io</b> account is not connected to your<b>cloud storage</b> or you are not logged in!',
  LOGOUT_QUESTION: '<center>You are going to <b>logout</b>.<br/><br/> Continue?</center>',
  GOBACK_FROM_DEVELOP_QUESTION:
    '<center>If you return to catalog your adjustments <b>will be lost</b>.<br/><br/>Return to catalog?</center>',
  DELETE_IMAGE_QUESTION:
    '<center>Are you sure you want to <b>delete</b> asset from your cloud storage?<br/><br/>If you are using cloud storage item will be placed to trash.</center>',
  RESETPASSWORD_QUESTION:
    '<center>You are going to <b>reset your password</b>.<br/>We will send you an <b>email</b> with instructions.<br/><br/> Continue?</center>',
  RESETPASSWORD_SUCCESS_MESSAGE:
    "<center>Reset password instructions sent to <b>%email%</b>. Don't forget to relogin after changing password. =)</center>",
  NOT_IMPLEMENTED_YET:
    "<center><b>Coming soon...</b><br/><br/>Feature is not ready yet, and we are working hard on it.<br/><br/>If you have any suggestions or ideas, just <a href='javascript:app.openSupport()'>let us now</a>.</center>",
  FORMAT_NOT_SUPPORTED_YET:
    "<center><b>Coming soon...</b><br/><br/>Editing of this raw format is not available yet, and we are working hard on it.<br/><br/>If you have any suggestions or ideas, just <a href='javascript:app.openSupport()'>let us now</a>.</center>",
  IMPORT_FORMAT_NOT_SUPPORTED_YET: {
    title: 'Unsupported format',
    text:
      'It seems that you\'ve dropped a file that Pics.io doesn\'t support yet.<br /><br />You can find supported formats list <a href="https://blog.pics.io/the-most-complete-list-of-pics-io-features-d9073d0c5034#.vgnlz9clz" target="_blank">here</a>.',
    OK_TEXT: 'Ok',
  },
  NO_PHOTO_IN_COLLECTION:
    "<div>This collection is empty... for now.</div><span>To add files, use Upload button, or select and drag'n'drop assets from other collections.</span>",
  NO_PHOTO_IN_COLLECTION_RECURSIVE:
    '<div>This collection is empty.</div><span>Try to switch the yellow toggle above to see if there are any assets in nested collections.</span>',
  NO_PHOTO_IN_COLLECTION_WITHOUT_UPLOAD: '<div>There are no files in this collection</div>',
  NO_PHOTO_IN_PROOFING_TEMPLATE:
    "<div>There are no files on this site.</div><span>Please use <a href='https://pics.io/' target='_blank'>pics.io</a> to add files.</span>",
  NO_PHOTO_IN_PROOFING_COLLECTION: '<div>There are no files in this collection.</div>',
  NO_PHOTO_IN_FILTER:
    '<div>No files match the filter</div><span>Try to change filtering options or reset filters</span>',
  NO_PHOTO_IN_SEARCH: '<div>Your search did not match any files.',
  NO_PHOTO_IN_SMART_COLLECTION: '<div>There are no files in this collection</div>',
  NO_PHOTO_IN_LIGHTBOARD:
    "<div>Your personal lightboard is empty... for now.</div><span>To add files, use Upload, or select and drag'n'drop assets from other collections.</span>",

  NO_PERMISSION_TO_ACCESS: 'You do not have enough permissions to perform this action.',
  CSV_IMPORT: {
    importingError: 'Importing error',
    close: 'Close',
    importNewCsv: 'Import new csv',
    downloadReport: 'Download CSV report',
    takingTooLong: 'This file is taking longer to process, once it’s done, we will send you a report about this import operation to email',
    done: 'Refresh and close',
    importTitle: 'Import your CSV file',
    learnMore: 'Learn more',
    dragnDrop: 'Drag and drop your CSV file here',
    or: 'or',
    browse: 'Browse',
    import: 'Import',
    validationDialogTitle: 'Incorrect type or size',
    validationDialogText: 'File must be csv type with size smaller that 20mb and bigger 0mb',
    textUploadCsv: 'Upload csv',
    canUploadOnlyOneFileDialogText: 'You can upload only one csv file',
    canUploadOnlyOneFileDialogTitle: 'Upload error',
    hasNoAccessDialogTitle: 'You have no access to upload csv. Please contact your manager',
    refreshText: 'Close this page and refresh the browser tab to see the imported metadata on assets',

    importText: () => (
      <>
        <p>
          Importing a CSV allows you to add new metadata to assets in Picsio. If a picsio_asset_id field in your CSV matches an existing asset in Picsio, it will be updated with the mapped values. Once the import is finished, you will get a CSV file where each row that failed to import contains an error reason.
        </p>
        <b>IMPORTANT:</b> CSV file must contain a picsio_asset_id column with IDs of assets you want to add new metadata to
      </>
    ),
  },
  DIALOGS: {
    DOWNLOAD_LIMIT: {
      TITLE: 'Download',
      TEXT:
        'If you download more than 50 assets at a time, they can only be downloaded as an archive',
    },
    LIMIT_CHECK_DUPLICATES: {
      TITLE: 'Exceeded assets selection limit',
      TEXT:
        'You have selected more than 10 000 assets. The system cannot check for duplicates at this point. Please reduce the number of selected assets and repeat the action again.',
      CANCEL_TEXT: 'Ok',
    },
    // WRONG_GOOGLE_ACCOUNT: {
    // 	TITLE: 'Wrong Cloud Storage Account',
    // 	TEXT_TPL:
    // 		"Note that you're authorized to <b style='color:#FC0'>{authorized}</b>.<br/><br/>Previously you've connected <b style='color:#FC0'>{saved}</b> to pics.io. <br><br>You won't see any files from your original Cloud Storage Account. You might want to login to your original Cloud Storage Account before.",
    // 	OK_TEXT: 'Ok, got it',
    // 	CANCEL_TEXT: 'Cancel',
    // },
    ERROR_PLAN_LIMIT: {
      TITLE: 'Plan limit reached',
      TEXT: 'In Pay As You Go you can share only 10 assets. To get unlimited single-shared assets, you should upgrade to Micro plan or higher.',
      OK_TEXT: 'Check plans',
    },
    DUPLICATE_ASSET_TO: {
      TITLE: 'Select collection to duplicate to',
      OK: 'Duplicate',
      CANCEL: 'Cancel',
    },
    HAS_WORKER_BUT_NO_CONTROLLER: {
      TITLE: 'Attention!',
      TEXT:
        'New version of Pics.io is available. Please reload the page to make sure the app works correctly.',
      OK_TEXT: 'Reload',
      CANCEL_TEXT: 'Cancel',
    },
    MOVE_TO_TRASH: {
      TITLE: 'Move to trash',
      TEXT: (assetsCount) => `You are about to delete ${assetsCount} asset(s) and move them to Trash`,
    },
    ERROR_TRASH_DIALOG: {
      TITLE: 'Error',
      TEXT_ASSET_BULK_OPERATION: (successful, failed, onClick) => (
        <>
          <p>
            {pluralize('asset', successful, true)} will be moved to trash, {pluralize('asset', failed, true)} cannot be trashed because you have a limited access to the files in Google Drive.
          </p>
          {getTextErrorGDBulk(onClick)}
        </>
      ),
      TEXT_ASSET_ONE_OPERATION: (onClick) => (
        getTextErrorGDOne(onClick)
      ),
    },
    ERROR_UNTRASH_DIALOG: {
      TITLE: 'Error',
      TEXT_ASSET_BULK_OPERATION: (successful, failed, onClick) => (
        <>
          <p>
            {pluralize('asset', successful, true)} will be restored from trash, {pluralize('asset', failed, true)} cannot be restored because you have a limited access to the files in Google Drive.
          </p>
          {getTextErrorGDBulk(onClick)}
        </>
      ),
      TEXT_ASSET_ONE_OPERATION: (onClick) => (
        getTextErrorGDOne(onClick)
      ),
    },
    ERROR_DOWNLOAD_ASSET: {
      TITLE: 'Error',
      TEXT: (onClick) => (
        getTextErrorGDOne(onClick)
      ),
    },
    UNABLE_TO_RENAME_ASSET: {
      TITLE: 'This name is already exists',
      TEXT: 'This name is used by the original file. Pick a different name for this duplicate',
    },
    ERROR_RENAME_ASSET: {
      TITLE: 'Error',
      TEXT: (onClick) => (
        getTextErrorGDOne(onClick)
      ),
    },
    ERROR_COPY_ASSET: {
      TITLE: 'Error',
      TEXT: (onClick) => (
        getTextErrorGDOne(onClick)
      ),
    },
    ERROR_DELETE_DIALOG: {
      TITLE: 'Error',
      TEXT_ASSET_BULK_OPERATION: (successful, failed, onClick) => (
        <>
          <p>
            {pluralize('asset', successful, true)} will be moved to trash,  {pluralize('asset', failed, true)} cannot be trashed because you have a limited access to the files in Google Drive.
          </p>
          {getTextErrorGDBulk(onClick)}
        </>
      ),
      TEXT_ASSET_ONE_OPERATION: (onClick) => (
        getTextErrorGDOne(onClick)
      ),
    },
    ATTENTION_DIALOG: {
      TITLE: 'Attention!',
      TEXT:
        "You're going to cancel your subscription. This will block an access to pics.io services to you and all your teammates. Continue?",
      OK_TEXT: 'Yes',
      CANCEL_TEXT: 'No',
    },
    LOGOUT_DIALOG: {
      TITLE: 'Logout',
      TEXT: 'You are going to <b>logout</b>. Continue?',
      OK_TEXT: 'Ok',
      CANCEL_TEXT: 'Cancel',
    },
    SAVE_EDITOR_CHANGES_DIALOG: {
      TITLE: 'Warning',
      TEXT: 'Want to close editor without saving changes?',
      OK_TEXT: 'Continue editing',
      CANCEL_TEXT: 'Close',
    },
    EDITOR_SAVE_AS_REVISION: {
      TITLE: 'Save changes',
      TEXT: 'Want to save the edited file as a new revision?',
      OK_TEXT: 'Save',
      CANCEL_TEXT: 'Continue editing',
    },
    EDITOR_CANT_SAVE_AS_REVISION: {
      TITLE: 'Warning',
      TEXT: (
        fileExtension,
        isRevisionsAllowed,
      ) => `Please note that Editor won’t be able to save your modified ${fileExtension.toUpperCase()} file back to Pics.io.</br>
        You will have to <b>download</b> the edited file on your device${
  isRevisionsAllowed ? ' and <b>upload it manually</b> as a new revision to Pics.io' : ''
}.`,
      LABEL: (fileExtension) => `Do not show this warning about ${fileExtension.toUpperCase()} again`,
    },
    DRAG_AND_DROP_ONLY_ASSETS: {
      TITLE: 'Error',
      TEXT: 'Please note that  drag and drop will work only for assets here',
      TEXT_CANCEL: 'Ok',
      TEXT_OK: null,
    },
    EDITOR_CANT_DOWNLOAD_FILE: {
      TITLE: 'Error',
      TEXT:
        'For some reason, Editor can’t get access to this file. Here’s what you can do:<ul><li>Refresh this page and try again later</li><li>Check if this file is still available in your Cloud Storage</li><li>Contact us at <a class="picsioLink" href="mailto:support@pics.io">support@pics.io</a> and we’ll see what we can do</li></ul>',
    },
    CHANGE_GOOGLE_DRIVE: {
      TITLE: 'Danger! Change your cloud storage',
      TEXT:
        'By changing your cloud storage account, you will lose all the changes you made in Pics.io. Continue?',
      OK_TEXT: 'Yes',
      CANCEL_TEXT: 'No',
    },
    CHANGE_WORKING_FOLDER: {
      TITLE: 'Warning',
      TEXT: (storageType) => (storageType === 's3'
        ? 'You are about to destroy all the information about your assets and the library itself in your Pics.io account. When you are changing your working folder all the changes you’ve made in Pics.io will be lost. This operation is not reversable and we will not be able to restore your information. Please note that your assets will remain in your Amazon S3 Bucket working folder.<br><br> If you are not sure about this action please contact <a class="picsioLink" href="mailto:support@pics.io">support@pics.io</a> and we will help you with the issue. If you are sure to proceed, please type “erase all data in my library”'
        : 'You are about to destroy all the information about your assets and the library itself in your Pics.io account. When you are changing your working folder all the changes you’ve made in Pics.io will be lost. This operation is not reversable and we will not be able to restore your information. Please note that your assets will remain in your Google Drive working folder.<br><br> If you are not sure about this action please contact <a class="picsioLink" href="mailto:support@pics.io">support@pics.io</a> and we will help you with the issue. If you are sure to proceed, please type “erase all data in my library”'),
      OK_TEXT: 'Yes',
      CANCEL_TEXT: 'No',
    },
    SOMETHING_WENT_WRONG: {
      TITLE: 'Oops! Something went wrong',
      TEXT:
        "<p>It seems you've come across a bug we've been hunting for a long time. Please send an email to <a href=\"mailto:support@pics.io?subject=${subject}&body=${body}\">support@pics.io</a> to inform us about this. We'll really appreciate if you could tell us how you got here. Also, please copy and paste this information in your email:</p><code>${code}</code><p>It's a rare error indeed, so refreshing your browser should probably help. Thanks for your patience!</p>",
      OK_TEXT: 'Refresh page',
      CANCEL_TEXT: 'Close',
    },
    WAIT_AND_RETRY: {
      TITLE: "Oops! You've sent too many requests",
      TEXT: ({ subject, body, code }) => (
        <>
          <p>
            It seems that you\'ve sent too many requests to your cloud storage. Please wait for a
            few minutes and press "Retry" button. In case this error continues to appear, please
            email us at{' '}
            <a href={`mailto:support@pics.io?subject=${subject}&body=${body}`}>support@pics.io</a>.
            We\'ll really appreciate if you could tell us how you got here. Also, please copy and
            paste this information in your email:
          </p>
          <code>{code}</code>
          <p>
            It\'s a rare error indeed, so refreshing your browser should probably help. Thanks for
            your patience!
          </p>
        </>
      ),
      OK_TEXT: 'Retry',
      CANCEL_TEXT: 'Close',
    },
    FILE_DELETED_FROM_GD: {
      TITLE: 'Oops! The file is not here',
      TEXT:
        'It seems that the file you\'re trying to access was deleted from your cloud storage. Please check if the file is still there. If the file is OK, please tell us about the problem at <a href="mailto:support@pics.io?subject=The file is not here">support@pics.io</a>',
      OK_TEXT: 'Ok',
    },
    LIGHTBOARD_FOLDER_NOT_FOUND_IN_GD: {
      TITLE: 'Oops! The lightboard folder is not here',
      TEXT:
        'It seems that the folder you\'re trying to access was deleted from your cloud storage. Please check if the folder is still there. If the folder is OK, please tell us about the problem at <a href="mailto:support@pics.io?subject=Lightboards folder is not found in your cloud storage">support@pics.io</a>',
      OK_TEXT: 'Ok',
    },
    NO_SPACE_LEFT: {
      TITLE: 'Oops! No space left',
      TEXT:
        "It seems that your cloud storage is full. Please make sure that you have enough space. You may delete something you don't need or just buy more space",
      OK_TEXT: 'Retry',
      CANCEL_TEXT: 'Close',
    },
    NO_SIZE_LEFT: {
      TITLE: 'Not enough disk space',
      TEXT:
        'Your storage has reached its limit and Pics.io cannot upload any more files. You can fix this by upgrading to a higher storage plan on the <a href="/billing?tab=overview">Billing</a> page.',
    },
    SLOW_CONNECTION: {
      TITLE: "Oops! You're on slow internet connection",
      TEXT:
        '<p>Seems that you have slow or unstable internet connection. Please check your connection and retry.</p><p><a href="https://help.pics.io/pics-io-settings/optimization-for-slow-internet-connection" target="_blank">Here</a> you can find some advice on how to optimize your work in Pics.io in case of slow internet connection</p>',
      OK_TEXT: 'Retry',
      CANCEL_TEXT: 'Ok',
    },
    UPLOAD_QUEUE_BUSY: {
      TITLE: 'Not so fast, please!',
      TEXT:
        'You are already uploading some assets to Pics.io. Please wait until they are fully uploaded before adding new assets',
    },
    btnYes: 'Yes',
    btnNo: 'No',
    btnOk: 'Ok',
    btnCancel: 'Cancel',
    REQUIRED_COMMENT: {
      TITLE: 'Add a comment',
      TEXT:
        'According to team policy, you are required to add a comment every time you upload a new revision.',
      TEXTEXPLAIN: 'Let your teammates know what has changed in this revision.',
    },
    FILES_NOT_SELECTED: {
      TITLE: 'Ooops! Files were not selected',
      TEXT: 'Please press OK and take one step back to select file(s) for uploading.',
    },
    WARNING_ALLOWED_COLLECTION: {
      TITLE: 'Warning',
      TEXT:
        '<p>You are about to deny access to all collections in Pics.io. Teammates with this role will not see any of your assets.</p><p>Are you sure you want to continue?</p>',
    },
    WARNING_EDIT_ASSET_COLLECTIONS: {
      TITLE: 'Warning',
      TEXT:
        'It seems that you don’t have permission to manage collections for some of the selected assets. Please contact your team owner for further assistance.',
    },
    WARNING_EDIT_ASSET_KEYWORDS: {
      TITLE: 'Warning',
      TEXT:
        'It seems that you don’t have permission to attach keywords to some of the selected assets. Please contact your team owner for further assistance.',
    },
    WARNING_CHANGE_ASSETS_ORDER: {
      TITLE: 'Warning',
      TEXT:
        'Custom sorting mode is already applied to this collection. Do you want to proceed and change the current sorting mode?',
      OK_TEXT: 'Yes, change the order',
      CANCEL_TEXT: 'No, I don’t',
    },
    WARNING_COLLECTION_NAME_LENGTH: {
      TITLE: 'Create new collection error',
      TEXT:
        'The collection could not be created. <br> It’s name is too long. Please note that the maximum allowed length is 500 characters. Reduce the name length and repeat the action again.',
      OK_TEXT: 'Ok',
    },
    WARNING_BUSY_COLLECTION: {
      TITLE: 'Incomplete operations error',
      TEXT: 'This collection has incomplete background operations. Please try again later.',
    },
    MOVE_COLLECTION_DIALOG: {
      TITLE: (collectionName) => `Move '${collectionName}' collection`,
      OK_TEXT: 'Move',
      CANCEL_TEXT: 'Cancel',
    },
    MOVE_ASSETS_DIALOG: {
      TITLE: 'Choose an action',
      COPY_RADIO: {
        LABEL: {
          COLLECTION: 'Add selected assets to the collection',
          LIGHTBOARD: 'Add selected assets to the lightboard',
        },
        DESCRIPTION: 'and keep them where they already are',
      },
      MOVE_RADIO: {
        LABEL: {
          COLLECTION: 'Move selected assets into the collection',
          LIGHTBOARD: 'Move selected assets into the lightboard',
        },
        DESCRIPTION: () => {
          const textOption = ~window.navigator.userAgent.toString().toLowerCase().indexOf('mac')
            ? 'option'
            : 'alt';
          return `and remove from collections where they are.<br />Just hold “${textOption}” key when you do this action next time`;
        },
      },
      CHECKBOX_LABEL: "Don't show it again",
      OK_TEXT: 'Ok',
      CANCEL_TEXT: 'Cancel',
    },
    VIDEO_ERRORS: {
      TITLE: 'Error',
      SOMETHING_WENT_WRONG: {
        TITLE: 'Something went wrong',
        TEXT:
          '<p>Please try again. Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.</p>',
      },
      UNABLE_TO_PROCESS:
        'Sorry, your cloud storage does not allow us to process this type of file. Please try to open it in your storage web interface.',
      NO_PERMISSION_TO_ACCESS: "Sorry, you don't have permission to access this video.",
      MAX_PLAYBACKS_EXCEEDED:
        'Sorry, video cannot be played because the maximum number of views has been exceeded.',
      OK_TEXT: 'Ok',
      CANCEL_TEXT: '',
    },
    DISALLOW_COLLECTION: {
      TITLE: 'Change permissions',
      TEXT:
        'You are about to change permissions for collection. Please note that some assets from this collection will be still available in the Lightboards of your teammates.',
      OK_TEXT: 'Continue',
      CANCEL_TEXT: 'Cancel',
    },
    ASSIGN_ROLE_WARNING: {
      TITLE: 'Change roles',
      TEXT:
        'You are about to change the role of your teammate. As a result his permissions on some collections will change. But, please note that some assets within these collections will be still available in the Lightboards of your teammate.',
      TEXT_MULTIPLE:
        'You are about to change the roles of your teammates. As a result their permissions on some collections will change. But, please note that some assets within these collections will be still available in the Lightboards of your teammates.',
      OK_TEXT: 'Continue',
      CANCEL_TEXT: 'Cancel',
    },
    CAPTCHA: {
      TITLE: 'Robot test',
      TEXT: (text) => `Our system has detected an unusual traffic from your network. Please pass our robot test to make sure you're human. Solve the following question: ${text}.`,
      OK_TEXT: 'Confirm',
    },
    CAPTCHA_ERROR: {
      TEXT: 'Please try again later',
    },
    FILE_TO_LARGE: {
      TITLE: 'File upload limit',
      TEXT: (maxSize, currentSize) => `The maximum upload file size is <strong>${maxSize}</strong>.<br/> The size of the file you are uploading is <strong>${currentSize}</strong>.<br/>Please reduce the file size and upload it again.`,
      TEXT_IN_GENERAL:
        'Maximum file size exceeded.<br/>Please reduce the file size and upload it again.',
    },
    INVALID_FILE_TYPE: {
      TITLE: 'The file format is invalid',
      TEXT: (extension) => `You can upload the files in the following formats: .jpeg, .jpg, .png, .gif. The file you are uploading is in ${extension} format. Please use the supported file format and try again.`,
      TEXT_IN_GENERAL:
        'The file format is invalid.<br/>Please use the supported file format and try again.',
    },
    ASSETS_LIMIT: {
      TITLE: 'Exceeded asset limit',
      TEXT:
        'You’ve reached a 50 000 asset limit available on your plan. Please upgrade your subscription to increase the limit.',
    },
    DOWNLOAD_CONSENT: {
      TITLE: (title) => title,
      TEXT: (text) => text,
      LABEL: "Don't show again",
      OK_TEXT: 'Confirm',
      CANCEL_TEXT: 'Reject',
    },
    UNDERSTAND: 'I understand',
    CANCEL: 'Cancel',
    DOWNLOAD_ASSETS_QUANTITY_LIMITATIONS: {
      TITLE: 'Too many files',
      TEXT:
        'More than 300 files are selected for download. Please deselect a few files and try again.',
    },
    DOWNLOAD_ASSETS_SIZE_LIMITATIONS: {
      TITLE: 'Archive size exceeds 20 GB',
      TEXT:
        'You have created an archive exceeding 20 GB. Please deselect a few files from the archive and try again.',
    },
    DOWNLOAD_COLLECTION_EMPTY: {
      TITLE: 'Download is not possible',
      TEXT: 'Collection is empty. Download is not possible.',
    },
    DOWNLOAD_COLLECTION_RESTRICTED: {
      TITLE: 'Download is restricted',
      TEXT:
        'You do not have permissions to download assets from these collections. Please contact your team managers for support.',
    },
    DOWNLOAD_COLLECTION_LIMITED: {
      TITLE: 'Limited download permissions',
      TEXT:
        'Some assets within these collections are restricted for download. Please check your download permissions and try again or continue without these assets.',
      OK_TEXT: 'Continue',
      CANCEL_TEXT: 'Discard',
    },
    SELECT_COLLECTION: {
      TITLE: 'Select collection to restore',
      OK: 'Confirm',
      CANCEL: 'Cancel',
    },
    UPLOAD_KEYWORDS_PERMISSION: {
      TITLE: 'No permission',
      TEXT:
        'You do not have a permission to manage keywords fields. Contact the team’s admin if you need this permission.',
      OK_TEXT: 'Ok',
    },
    ARCHIVE_COLLECTION_DIALOG: {
      TITLE: 'Confirm archiving',
      TEXT: (name, websites) => `You are about to archive the following items: <span class="highlight">${name}</span> with all the nested collections and assets. <br/> This action requires confirmation. ${
        websites.length
          ? `<br/><br/> <span class="highlight">Attention!</span> This operation will also remove the website: ${websites.map(
            (website) => `<br/> <a href='${website}' target='_blank'>${website}</a>`,
          )}`
          : ''
      }`,
      OK: 'Confirm',
      CANCEL: 'Cancel',
    },
    UNARCHIVE_COLLECTION_DIALOG: {
      TITLE: 'Confirm unarchiving',
      TEXT: (name, parentNames) => `You are about to unarchive the following items: <span class="highlight">${name}</span> with all the nested collections and assets. <br/> This action requires confirmation. ${
        parentNames.length
          ? `<br/><br/> <span class="highlight">Attention!</span> The following parent collection(s) will be also unarchived: <span class="highlight">${parentNames}</span>`
          : ''
      }`,
      OK: 'Confirm',
      CANCEL: 'Cancel',
    },
    ARCHIVE_ASSET_DIALOG: {
      TITLE: 'Confirm archiving',
      TEXT: (name, link) => `You are about to archive the following items: <span class="highlight">${name}</span>. <br/> This action requires confirmation. ${
        link
          ? `<br/><br/> <span class="highlight">Attention!</span> After this operation, the asset will become inaccessible via the following link: <a href="${link}" target="_blank">${link}</a>`
          : ''
      }`,
      OK: 'Confirm',
      CANCEL: 'Cancel',
    },
    ARCHIVE_ASSETS_DIALOG: {
      TITLE: 'Confirm archiving',
      TEXT: (assets, count, sharedAssets) => `You are about to archive the following items: ${assets}${
        count > 0 ? ` and <span class="highlight">${count}</span> more.` : '.'
      } <br/> This action requires confirmation. ${
        sharedAssets.length
          ? `<br/><br/> <span class="highlight">Attention!</span> Some assets from those you want to archive are shared. After this operation, they will become inaccessible via the following links: ${sharedAssets.map(
            (link) => `<br/> <a href='${link}' target='_blank'>${link}</a>`,
          )}`
          : ''
      }`,
      OK: 'Confirm',
      CANCEL: 'Cancel',
    },
    ARCHIVE_ALL_ASSETS_DIALOG: {
      TITLE: 'Confirm archiving',
      TEXT: (collectionName) => `You are going to archive all assets in the <span class="highlight">${collectionName}</span> collection. <br/> Do you want to archive the <span class="highlight">${collectionName}</span> collection?`,
      OK: 'Yes',
      CANCEL: 'No',
    },
    UNARCHIVE_ASSETS_DIALOG: {
      TITLE: 'Confirm unarchiving',
      TEXT: (assets, count) => `You are about to unarchive the following items: ${assets}${
        count > 0 ? ` and <span class="highlight">${count}</span> more.` : '.'
      } <br/> This action requires confirmation.`,
      OK: 'Confirm',
      CANCEL: 'Cancel',
    },
    UNARCHIVE_ALL_ASSETS_DIALOG: {
      TITLE: 'Confirm unarchiving',
      TEXT: (collectionName) => `You are going to unarchive all assets in the <span class="highlight">${collectionName}</span> collection. Do you want to unarchive the <span class="highlight">${collectionName}</span> collection?`,
      OK: 'Yes',
      CANCEL: 'No',
    },
    UNARCHIVE_ASSETS_TO: {
      TITLE: 'Select collection to restore to',
      OK: 'Restore',
      CANCEL: 'Cancel',
    },
    TEAMMATE_ARCHIVED_COLLECTION: {
      TITLE: 'Collection archived',
      TEXT: (initiator, name) => `${initiator} archived the <span class="highlight">${name}</span> collection.`,
    },
    TEAMMATE_UNARCHIVED_COLLECTION: {
      TITLE: 'Collection unarchived',
      TEXT: (initiator, name) => `${initiator} unarchived the <span class="highlight">${name}</span> collection.`,
    },
    TEAMMATE_DELETED_ARCHIVED_COLLECTION: {
      TITLE: 'Collection deleted',
      TEXT: (initiator, name) => `${initiator} deleted the <span class="highlight">${name}</span> collection.`,
    },
    TEAMMATE_ARCHIVED_ASSET: {
      TITLE: 'Asset archived',
      TEXT: (initiator, name) => `${initiator} archived the <span class="highlight">${name}</span> asset.`,
    },
    TEAMMATE_UNARCHIVED_ASSET: {
      TITLE: 'Asset unarchived',
      TEXT: (initiator, name) => `${initiator} unarchived the <span class="highlight">${name}</span> asset.`,
    },
    ASSETS_LIMIT_APP: {
      TITLE: 'Assets limit reached',
      TEXT: (assetsLimit, isTrialUser = false) => `You have reached a ${assetsLimit} assets limit for ${
        isTrialUser ? 'a trial period' : 'your plan'
      }. To continue adding more assets, consider subscribing to one of our plans on Billing page.`,
      TEXT_OK: 'Go to Billing',
    },
    ASSETS_LIMIT_INBOX: {
      TITLE: 'Inbox has reached files limit',
      TEXT: () => 'The inbox has reached its limit. You can notify its owner so they address this issue.',
      TEXT_OK: 'Notify inbox owner',
      TEXT_CANCEL: 'Cancel',
      TEXT_SUCCESS: 'Notification for inbox owner has been sent.',
    },
    ROLES_LIMIT_APP: {
      TITLE: 'Roles limit reached',
      TEXT: (rolesLimit, isTrialUser = false) => `You have reached ${rolesLimit} roles limit for ${
        isTrialUser ? 'a trial period' : 'your plan'
      }. To continue adding more roles, consider subscribing to one of our plans on Billing page.`,
      TEXT_OK: 'Go to Billing',
    },
    KEYWORDS_MERGE: {
      TITLE: 'Choose merge-to keyword.',
      OK: 'Merge',
      CANCEL: 'Cancel',
    },
    KEYWORDS_MERGE_ALL_SELECTED: {
      TITLE: 'Can\'t merge keywords',
      TEXT: 'To merge a keyword, at least one other keyword must be unselected. Try deselecting one or more keywords and repeat the operation.',
      OK: 'Ok',
    },
    KEYWORDS_MERGE_CONFIRM: {
      TITLE: (count) => `Merge ${pluralize('keyword', count)}`,
      TEXT: (count) => `You're going to merge ${pluralize('keyword', count)}. The operation is not reversible. Continue?`,
      OK: 'Merge',
      CANCEL: 'Cancel',
    },
    KEYWORDS_NOT_IN_ROOT: {
      TITLE: (count) => `Merge ${pluralize('keyword', count)}`,
      TEXT: (keywords) => `Merging is possible only for keywords that are not sub-keywords of other keywords. The following keywords are sub-keywords: ${keywords} <br/> By continuing this merge process, you merge all selected keywords except the above mentioned.<br/>`,
      OK: 'Continue',
      CANCEL: 'Cancel',
    },
    KEYWORDS_MERGE_ONLY_ROOT: {
      TITLE: (count) => `Merge ${pluralize('keyword', count)}`,
      TEXT: 'Only root-keywords merge is possible. All of the selected keywords are attached to other keywords. Detach them and try merging again.',
      OK: 'Ok',
    },
    KEYWORDS_DELETE_LIMIT: {
      TITLE: (count) => `Delete ${count} ${pluralize('keyword', count)}`,
      TEXT: (limit) => `It is not possible to delete more than <span class="highlight">${limit}</span> keywords in one batch due to processing speed limitations.<br />Select fewer keywords and try again.`,
      CANCEL: 'Ok',
    },
    KEYWORDS_DELETE: {
      TITLE: (count, isDeleteAll) => `Delete ${isDeleteAll ? 'ALL' : ''} ${pluralize('keyword', count)}${isDeleteAll ? '?' : ''}`,
      TEXT: (name, count) => (name
        ? `You're going to delete <span class="highlight">${name}</span>. The operation is not reversible. Continue?`
        : `You're going to delete <span class="highlight">${count} ${pluralize('keyword', count)}</span>. The operation is not reversible. Continue?`
      ),
      OK: 'Delete',
      CANCEL: 'Cancel',
    },
  },

  SPINNERS: {
    GENERATING_THUMBNAIL: 'Generating thumbnail...',
    STARTING_APPLICATION: 'Starting Pics.io...',
    LOADING_LIBRARY: 'Loading library...',
    LOADING_COLLECTIONS: 'Loading collections...',
    LOADING_KEYWORDS: 'Loading keywords...',
    CONNECTING_STORAGES: (storageName) => (storageName === 'picsioStorage'
      ? 'Connecting Pics.io storage...'
      : storageName === 's3'
        ? 'Connecting Amazon S3...'
        : 'Connecting Google Drive...'),
    CHECKING_SUBSCRIPTION: 'Checking subscription...',
    SEARCHING: 'Searching...',
    LOADING: 'Loading...',
    DOWNLOADING: 'Downloading...',
    CHECKING_DOWNLOAD_PERMISSIONS: 'Checking download permissions...',
  },

  TOAST: {
    COLLECTION_ARCHIVED: (collectionName) => `Collection "${collectionName}" has been archived`,
    COLLECTION_UNARCHIVED: (collectionName) => `Collection "${collectionName}" has been unarchived`,
    ASSETS_ARCHIVED: (assetsCount) => `${assetsCount} asset${assetsCount > 1 ? 's' : ''} ${
      assetsCount > 1 ? 'have' : 'has'
    } been archived`,
    ASSETS_UNARCHIVED: (assetsCount) => `${assetsCount} asset${assetsCount > 1 ? 's' : ''} ${
      assetsCount > 1 ? 'have' : 'has'
    } been unarchived`,
    ARCHIVED_COLLECTION_DELETED: (collectionName) => `Collection "${collectionName}" has been removed`,
  },

  COLLECTION_REMOVED: 'Collection removed',
  COLLECTION_IS_EXISTED_AND_ARCHIVED:
    'There is an archived collection with the same name. Try using a different name. ',
  UNABLE_TO_CREATE_COLLECTION: 'Unable to create collection. Please, contact support@pics.io.',
  UNABLE_TO_RENAME_COLLECTION: 'Unable to rename collection. Please, contact support@pics.io.',
  UNABLE_TO_REMOVE_COLLECTION: 'Unable to remove collection. Please, contact support@pics.io.',
  UNABLE_TO_REMOVE_COLLECTION_NO_GD_PERMISSIONS:
    '<p>The collection was <span class="highlight">not deleted</span> from Pics.io.<br />The user does not have sufficient <span class="highlight">permissions to delete</span> this folder from Cloud Storage Account.</p><p>Check permissions in Cloud Storage Account to perform the removal.<br />Consult our <a href="https://help.pics.io/en/articles/1269158-deleting-assets-from-pics-io" target="_blank">HelpCenter</a> for details.</p>',
  UNABLE_TO_MOVE_COLLECTION:
    'Unable to move collection.<br /> Try again and contact <a class="picsioLink" href="mailto:support@pics.io">support</a> if mistake remains.',
  UNABLE_TO_CHANGE_COLLECTION_COLOR:
    'Unable to change collection color. Please, contact support@pics.io.',
  UNABLE_TO_CHANGE_COLLECTION_DESCRIPTION:
    'Unable to change collection description. Please, contact support@pics.io.',
  UNABLE_TO_REMOVE_IMAGE: 'Unable to remove asset. Please, contact support@pics.io',
  THUMBNAIL_GENERATE_SUCCESS: 'Thumbnail generated',
  UNABLE_TO_GENERATE_THUMBNAIL: 'Unable to generate thumbnail. Please, contact support@pics.io',

  FOLDER_SYNC: {
    syncAlreadyRunningErrorTitle: 'Folder sync is not available now',
    syncAlreadyRunningErrorText: 'Wait a sec, please. It seems that sync is already running.',
    syncHasStartedTitle: 'Sync has started',
    syncHasStartedText: 'We have started syncing this collection with your storage, this operation will be running in background. You can continue using Picsio',
  },

  FILES_ARE_REMOVED: 'Files are removed',
  FILES_WERENT_REMOVED: "Files weren't removed. Please, try again later",

  ERROR_UPDATING_ASSET:
    "Error in updating asset. Please try again. Contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats.",
  ERROR_GETTING_AGGREGATED_DATA:
    "Error in retrieving assets data. Please try again. Contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats.",
  ERROR_ADD_REACTION:
    "Error in adding reaction. Please try again. Contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats.",

  TAGLIST: {
    errorItemNotValid: 'The {type} is not valid.',
    errorItemsNotValid: 'The {types} not valid.',
    errorItemIsEmpty: 'The field is empty.',
    errorItemAlreadyAdded: 'This {type} is already added.',
  },

  ACCOUNT: {
    title: 'My account',

    tabTitleProfile: 'Profile',
    tabTitleSettings: 'Settings',
    tabTitleNotifications: 'Notifications',
    tabTitleSecurity: 'Security',
    tabTitleLegal: 'Legal',

    errorName: 'Should always exists.',
    errorBlog: 'The link is not valid.',
    errorLinkStartURL: 'Link should start with',
    errorLinkNotValid: 'The link is not valid.',
    placeholderEnterEmail: 'Enter new email',

    titleProfile: 'Profile',
    inputLabelEmail: 'Email',
    linkResetPassword: 'Reset password',
    inputLabelName: 'Full name',
    inputPlaceholderName: 'Full name',
    inputLabelPosition: 'Position',
    inputPlaceholderPosition: 'Position',
    inputPhotoButtonText: 'Add your photo',
    inputPhotoDescription:
      'Please use small square images 125-250 pixels in a transparent background: PNG or GIF. You can also use small progressive JPG. Image size should not exceed 1 MB.',
    inputLabelPhone: 'Phone',
    inputLabelBlogURL: 'Blog url',
    inputLabelAbout: 'About',
    inputLabelContacts: 'Contacts',
    titleChangePassword: 'Change password',
    inputLabelCurrentPassword: 'Current password',
    inputLabelNewPassword: 'New password',
    inputLabelConfirmNewPassword: 'Confirm new password',

    sectionNameNetwork: 'Network',
    sectionPreviewLabel: 'Image size on preview screen',
    sectionUploadLabel: 'Upload one asset at a time',
    sectionUploadText:
      'If this option is set Pics.io will upload only one asset at a time. Useful for slow connections and heavy assets.',

    sectionNameLocale: 'Date and time format',
    sectionLocaleText: 'Change of this option affects date and time format in Pics.io.',

    sectionNameScheme: 'UI color scheme',
    sectionSchemeLabelDark: 'Dark',
    sectionSchemeLabelLight: 'Light',

    noteSlackConnectedStart:
      "Pics.io bot connected to <a class='picsioLink' href='https://slack.com/apps/manage' target='_blank'>",
    noteSlackConnectedEnd:
      "</a> Slack team.<br><br>To receive notifications, you need to invite bot to one of channels by sending message <b class='msgInvPicsio'>/invite @picsio</b> to that channel.<br/>",
    noteSlackNotConnected: 'Pics.io is not connected to Slack.',
    noteAskOwner: ' Ask your team owner to connect to Slack',
    noteNotificationWillSent: 'Notifications will be sent to',

    titleYouCan: 'You can also do the following:',

    linkSeeAllData: 'See all personal data',
    textSeeAllData:
      'You can see all personal information about yourself that you entered in your User Profile (name, email, role, userpic, position in your team, etc.)',

    linkDownloadAllData: 'Download all personal data',
    textDownloadAllData:
      'You can download all personal information about yourself that you entered in your User Profile (name, email, role, userpic, position in your team, etc.). The information will appear as a .js file in the downloads folder of your browser.',

    linkDeleteAllData: 'Delete all personal data',
    textDeleteAllData:
      'You can delete all personal information about yourself that you used during registration in Pics.io. This is an irreversible action, after which you will not be able to use Pics.io service. To regain access, you will have to register again.',
    titleDeleteAllData: 'Delete all personal data',
    warningDeleteAllData: 'Warning! You’re going to delete all your personal data from Pics.io!',
    contentDeleteAllData:
      'You have the right to delete all information about yourself from Pics.io and our partners’ databases, such as your name, email, role, userpic, position in your team, etc.<br><br>Please note that this action is irreversible. After you choose to delete all your personal information from Pics.io database, Pics.io team will not be able to help you restore it. And you will no longer be able to use Pics.io service unless you register again.<br><br>Pics.io team will delete all your personal data manually and beyond retrieval within the next 30 days. A notification will be sent to you when it is done. <br><br>Please enter your email and password, and tick the box “I understand” to proceed with deleting.',
    labelDeleteAllData: 'I understand',
    buttonDeleteAllData: 'Delete',
    dailogTextDeleteAllData:
      'Ok, we respect your decision. Pics.io team will delete all your personal data manually and beyond retrieval within the next 30 days. A notification will be sent to you when it is done.',

    linkRestrictProcessing: 'Restrict processing',
    textRestrictProcessing:
      'With this irreversible action you can prevent Pics.io team from using your email address and other personal information, which is necessary to provide you with technical support and identify you as a user. You will be able to use Pics.io, but without any support from Pics.io team.',
    titleRestrictProcessing: 'Restrict processing',
    warningRestrictProcessing:
      'Warning! You’re going to restrict Pics.io from using your personal information!',
    contentRestrictProcessing:
      'You have the right to restrict Pics.io from using your personal information. However, with this irreversible action you will prevent Pics.io team from providing you with technical support and identify you as a system user. You will be able to use Pics.io service, but Pics.io team will not be able to help you restore your password in case you forget it or render any other technical assistance if you need it.<br><br>Pics.io team will perform this action manually and beyond retrieval within the next 30 days. A notification will be sent to you when it is done.<br><br>Please enter your email and password, and tick the box “I understand” to proceed with restricting.',
    labelRestrictProcessing: 'I understand',
    buttonRestrictProcessing: 'Restrict',
    restricted: 'Processing restricted',

    linkUnsubscribe: 'Unsubscribe',
    textUnsubscribe:
      'You can choose not to receive any onboarding information, newsletters, and other marketing materials from Pics.io to your email.',

    linkRevokeConsents: 'Revoke consent',
    textRevokeConsents:
      'You have the right not to agree with our Terms of Service / Privacy Policy. If you revoke your consent, you will not be able to access Pics.io service.',
    titleRevokeConsents: 'Revoke consent',
    warningRevokeConsents:
      'Warning! You’re going to revoke your consent to our Terms of Service and Privacy Policy',
    contentRevokeConsents:
      'Your consent to our Terms of Service and Privacy Policy is the necessary condition so that Pics.io could deliver any services to you. You will not be able to use Pics.io until you accept them.<br><br>If you are sure about revoking your consent, please enter your email and password, and tick the box “I understand” to proceed with this action.',
    labelRevokeConsents: 'I understand',
    buttonRevokeConsents: 'Revoke',

    titleSecurity: 'Security',
    labelAuthentication: 'Enable two-factor authentication',
    labelAuthenticationTooltip: 'Switch on the two-factor authentication for your account',
    setup2FANow: 'Set up two-factor authentication now',
  },

  TWO_FACTOR_AUTH: {
    scan:
      'Scan this image with your authenticator app. You will see a 6-digit code on your screen. Enter the code below to verify your phone.',
    inCase:
      'In case of emergency, the code below will be necessary to disable your two-factor authentication and access your account.',
    save: 'Store this code in safe place',
    input: 'Please input the code below:',
    complete: 'Two-factor authentication enabled',
    error:
      "Something went wrong. Please try again. Contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats.",
    termsTitle: 'Two-factor authentication terms of use.',
    upgradeTooltip: () => (
      <>
        Two-factor authentication functionality is available on Small, Medium and Enterprise plan.{' '}
        <br /> Click to Subscribe now.
      </>
    ),
    planRestriction: (onClick) => (
      <p>
        Two-factor authentication functionality is available on Small, Medium and Enterprise plan.{' '}
        <span className="picsioLink" onClick={onClick}>
          Subscribe now
        </span>{' '}
        to keep using it after trial expires.
      </p>
    ),
    myAccountTextEnabled: 'You have enabled two-factor authentication.',
    myTeamTextEnabled: () => (
      <span>
        You have activated two-factor authentication login for all teammates.
        <br /> Each one of them has received a notification to set up the second step for their
        account.
      </span>
    ),
    setupNow: 'Set up two-factor authentication now',
  },

  SET_NEW_PASSWORD: {
    oldPassword: 'Old password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    success: 'New password set successfully',
    fail: 'Can not set new password',
    emptyPasswordError: 'Password cannot be empty',
    passwordLengthError: 'Password needs to be at least 8 characters long',
    passwordsAreNotEqualError: 'Passwords are not equal',
    save: 'Save',
  },

  TWO_FACTOR_SCREEN: {
    recoveryTitle:
      'Use the recovery code to access your account and reconfigure two-factor authentication',
    useApp: (handleClick) => (
      <p>
        Or use{' '}
        <span className="picsioLink" onClick={handleClick}>
          app for a authentication
        </span>
      </p>
    ),
    recoveryButton: 'Submit',
    enterCodeTitle: 'Input 6-digit code to proceed to Pics.io',
    enterCodeLabelApp: 'Enter the six-digit code from Google authentification app',
    enterCodeLabelEmail: 'Enter the six-digit code from email',
    resendButton: 'Resend code',
    useRecovery: (handleClick) => (
      <>
        or enter{' '}
        <span className="picsioLink" onClick={handleClick}>
          recovery code
        </span>
      </>
    ),
  },

  CONFIRM: {
    placeholderLogin: 'Login',
    placeholderPassword: 'Password',
    emailInvalid: 'Email is invalid',
    passwordInvalid: 'Password is empty',
    checkboxInvalid: 'Should be checked',
    serverError: 'Email or password is incorrect',
  },

  KEYWORDS: {
    alertCantAddKeyword: () => (
      <div>
        Can't add keyword. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
  },

  AUDIT: {
    title: 'Audit trail',
    logsTab: 'Logs',

    analyticsTab: 'Analytics',

    tabTitleUser: 'Any user',
    tabTitleEvent: 'Any event',

    linkWebsite: 'website',
    linkTeam: 'your team',

    downloadCSV: 'Download CSV',

    textNothingFound:
      '<div>Nothing found.</div><div>Please try again with some different keywords.</div>',
    textNoRecords: 'There are no records yet.',

    syncToStart: 'started sync operation to your cloud storage',
    syncToSuccess: 'Sync operation to your cloud storage finished',
    syncToFail: 'Sync operation to your connected cloud storage failed',
    syncFromStart: 'started sync operation from your cloud storage',
    syncFromSuccess: 'Sync operation from your cloud storage finished',
    syncFromFail: 'Sync operation from your cloud storage failed',

    timeOptionsAny: 'Anytime',
    timeOptionsToday: 'Today',
    timeOptionsYesterday: 'Yesterday',
    timeOptionsLast7: 'Last 7 days',
    timeOptionsLast30: 'Last 30 days',
    timeOptionsLast90: 'Last 90 days',
    timeOptionsCustomized: 'Customized',

    tagImageAdded: 'Asset uploaded to collection',
    tagImageDeleted: 'Asset deleted',
    tagCommentAdded: 'Comment added',
    tagCommentDeleted: 'Comment deleted',
    tagAssetDownloaded: 'Asset downloaded',
    tagRevisionCreate: 'Revision created',
    tagRatingChanged: 'Rating changed',
    tagFlagChanged: 'Flag changed',
    tagColorChanged: 'Color changed',
    tagAssetsUploaded: 'Assets uploaded',
    tagAssetsAttached: 'Assets attached',
    tagAssetsDetached: 'Assets detached',
    tagAssetsMoved: 'Assets moved',
    tagAssetsKeywordAttached: 'Keywords attached',
    tagAssetsKeywordDetached: 'Keywords detached',
    tagAssetsMetadataChanged: 'Metadata changed',
    tagCollectionCreated: 'Collection created',
    tagCollectionDeleted: 'Collection deleted',
    tagCollectionMoved: 'Collection moved',
    tagCollectionShared: 'Collection shared',
    tagCollectionUnshared: 'Collection unshared',
    tagCollectionColorChanged: 'Collection color changed',
    tagCollectionDescriptionChanged: 'Collection description changed',
    tagTeammateInvited: 'Teammate invited',
    tagTeammateConfirmed: 'Teammate confirmed',
    tagTeammateRejected: 'Teammate rejected',
    tagRoleChanged: 'Role changed',
    tagTeammateRemoved: 'Teammate removed',
    tagSyncToStart: 'Sync from Pics.io to GD started',
    tagSyncToSuccess: 'Sync from Pics.io to GD finished',
    tagSyncToFail: 'Sync Pics.io to GD failed',
    tagSyncFromStart: 'Sync from GD to Pics.io started',
    tagSyncFromSuccess: 'Sync from GD to Pics.io finished',
    tagSyncFromFail: 'Sync GD to Pics.io failed',
    metadatingFailed: 'Extracting metadata failed',
    replicationFailed: 'Saving assets metadata to your cloud storage failed',
    contentingFailed: 'Content extracting failed',
    keywordingFailed: 'Autokeywording failed',
    workingFolderChanged: 'Working folder changed',
    You: 'You',
    changedWorkingFolder: 'changed working folder',
    changedWorkingFolderTo: 'changed working folder to',
    trialExpires: 'Trial expires',
    trialExpiresIn2Days: 'Trial expires in 2 days',
    trialExpiresIn5Days: 'Trial expires in 5 days',

    MedatataExtractingFailedFor: 'Metadata extracting failed for',
    SavingAssetsMetadataToYourStorageFailedFor:
      'Saving assets metadata to your cloud storage failed for',
    AutogenerateKeywordsFailedFor: 'Autogenerate keywords failed for',
    ContentExtractingFailedFor: 'Content extracting failed for',

    assetApproved: 'Asset approved',
    assetDisapproved: 'Asset disapproved',
    assetsAssigned: 'Assets assigned',
    assetsUnassigned: 'Assets unassigned',
    approved: 'approved',
    disapproved: 'disapproved',
    asset: 'asset',
    revision: 'revision',
    and: 'and',
    more: 'more',
  },

  BILLING: {
    billingPlanDescription(teammates, websites) {
      if (!teammates && !websites) {
        return '$18/user<br/>$12/website<br/>';
      }
      return `<b>${teammates}</b> users<br/><b>${websites}</b> websites`;
    },
    billingOldPlanInfo(activePlanPrice, activePlanInterval, periodEndDateFormatted) {
      return `<span style="color: #FF6B00">You are subscribed to a plan that was discontinued, but your price remains the same: $${activePlanPrice}/${activePlanInterval}, next payment ${periodEndDateFormatted}.<br/> If you want to change subscription parameters (teammates, websites etc.), contact us at <a href="mailto:support@pics.io" class="picsioLink">support@pics.io</a>.</span>`;
    },
    title: 'Billing',
    logoutText: 'Logout',

    tabTitleOverview: 'Overview',
    tabTitleInfo: 'Info',
    tabTitleInvoices: 'Invoices',
    tabTitleCard: 'Card',

    stateInvoices: 'Fetching invoices...',

    textCantValidateCard:
      "Can't validate card. Your card WON'T be charged. This indicates technical problems. Please contact support@pics.io.",
    textEmptyCoupon: "Empty coupon can't be applied",
    textCoupon: 'Coupon',
    textCouponCant: "can't be applied to your account.",
    textCouponCant2: "can't be applied",
    textCouponSuccess: 'was successfully applied',
    textCouponApplying: 'Applying coupon...',
    textCouponDialogTitle: 'Enter your coupon here',
    textCardDetailsLoading: 'Loading card details...',
    textCardCantCheck:
      "Can't check card status! Please try again later or contact support@pics.io.",
    textCardSaving: 'Saving card details...',
    textCardChanged: 'Card was successfully changed',
    textCardCantChange: "Can't change card! Please try again later or contact support@pics.io.",
    textPaymentLoadingDetails: 'Loading payment details...',
    textPaymentFinishing: 'Finishing payment...',
    textPlanChangedSuccess: 'Plan was successfully changed',
    textPaymentCantFinishing:
      "Can't finish payment! Please try again later or contact support@pics.io.",
    textDetailsSaving: 'Saving subscription details...',
    textDetailsLoading: 'Loading subscription details...',
    textSubscriptionCancelled: 'Subscription cancelled',
    textSubscriptionCantCancel:
      "Can't cancel subscription! Please try again later or contact support@pics.io.",
    textTitleThanks: 'Thank you!',
    textTextSubcriptionRenewed:
      'Your subcription has been renewed.<br>Thank you for choosing Pics.io. DAM service.',
    textBtnGoToLibrary: 'Ok, take me to my library now.',

    textBillingSubscribed1: "You're subscribed to",
    textBillingSubscribed2:
      'plan that is discontinued. You may upgrade to our new plans or stay with your current subscription.',
    textYourSubscription1: 'Your subscription to',
    textYourSubscription2: 'plan',
    textYourSubscription3: 'Will cancel at',
    textYourSubscribed1: 'You are subscribed to',
    textYourSubscribed2: 'plan',
    textYourSubscribed3: 'Next payment at',
    textYourTrial1: 'You are on trial period that',
    textYourTrial2: 'will end at',
    textYourTrialEnded:
      'Your trial period or subscription ended.<br/>Please subscribe to any plan.',

    textInfo:
      "See our <a href='https://pics.io/privacy-policy' target='_blank' class='picsioLink'>privacy policy</a><br />for details.",

    inputLabelCompany: 'Company name',
    inputLabelName: 'Name',
    inputLabelSurname: 'Surname',
    inputLabelStreetAdress: 'Street address',
    inputLabelCity: 'City',
    inputLabelPostalCode: 'Postal code',
    selectLabelCountry: 'Country',
    inputLabelState: 'State',
    inputLabelEmail: 'Email',
    inputLabelInformation: 'Information',

    inputPlaceholderCompany: 'Company',
    inputPlaceholderName: 'John',
    inputPlaceholderSurname: 'Doe',
    inputPlaceholderStreetAdress: 'Street address',
    inputPlaceholderCity: 'Los Angeles',
    inputPlaceholderPostalCode: '123456',
    inputPlaceholderState: 'California',
    inputPlaceholderEmail: 'johndoe@mail.com',
    inputPlaceholderInformation:
      'Additional information, i. e. full name of the company. This is information will appear in all invoices and receipts. Do not enter any confidential financial information here.',

    invoiceThDate: 'Date',
    invoiceThAmount: 'Amount',
    invoiceThDescription: 'Description',
    invoiceThStatus: 'Status',
    invoiceNone: 'No invoices',
    invoiceSubscriptionTo: 'Subscription to',
    invoiceInvoiceFrom: 'Invoice from',

    titlePlan: 'Plan',
    titleInfo: 'Info',
    titleInvoices: 'Invoices',

    titleCredits: 'Credits',
    textCreditsBuy: 'Buy',
    textChangePlan: 'Change plan',
    textSelectPlan: 'Select plan',
    textUnsubscribe: 'Unsubscribe',
    titleCard: 'Card',
    titleCardAndCoupon: 'Card and coupon',
    textRedeemCoupon: 'Redeem coupon',
    textAddCoupon: 'Add coupon',

    textPoweredBy: 'Powered by',
    textPaymentNote: 'Pics.io does not store any credit card information. ',
    textPaymentNoteHandled: 'All payments are processed in Stripe.',

    planIndividualsText: 'Perfect for individuals',
    planIndividualsWebsites: 'Websites',
    planIndividualsTeammates: 'Teammates',
    textMonth: 'month',
    textUsers: 'Up to <b>{value}</b> users in your team',
    textFreeWebsites: 'free websites',

    textCardChange: 'Change card',
    textCardNoAdded: 'No card added',
    textCardAdd: 'Add new card',
    textValidate: 'Validate',

    textAppliedCoupon: (id, off, duration) => (
      <span>
        Applied coupon <span>{id}</span> <br /> -{off} {duration}{' '}
      </span>
    ),

    checkoutSubscribe: 'Subscribe',
    confirmationTitle: 'Change subscription',
    confirmationChangePlan: (planName) => `You are about to change your plan to <b>${planName}</b>.<br><br> Are you sure?`,

    titleBuyCredits: 'Buy credits',
    textEnterAmount: 'Please enter amount you want to buy (USD)',
    placeholderNumber: 'Number',
    textBuy: 'Buy',

    titleTransactionComplete: 'Transaction complete',
    textYouBought: (amountValue) => `You bought ${amountValue} credits. Your balance is now`,

    titleTransactionFailed: 'Transaction failed',
    textTryAgain: 'Error, please try again later',

    statusPaid: 'Paid',
    statusUnpaid: 'Unpaid',
    statusUpcoming: 'Upcoming',

    storageDisabledByPlan: 'Available starting with<br />Pay as you go',
    storageDisabledBySize: 'The amount of data exceeds the<br />capacity of the plan.',
    storageSizeUserUsing: (amount, unit) => `You are using ${amount} ${unit}`,
    textRequestMoreStorage: 'Request more storage',
    textProcessingRequest: 'Processing request...',
    DIALOG_LIMITS_EXCEEDED: {
      title: 'Limit exceeded',
      text:
        'On your current plan you have more teammates or websites than is included into the price of the plan you want to upgrade to. Ask our support team to add extra teammates or websites to your account on a target plan',
      btnOk: 'Write to support',
    },
    textStorageRequest: 'We’ve received your request for additional storage. Our Support Team will contact you shortly.',
  },

  CUSTOMFIELDS: {
    alertCantUpdateData:
      "Can't update data. Please try again. Contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats.",
  },

  CUSTOMFIELDSSCHEMA: {
    configTypesString: 'Text',
    configTypesInt: 'Number',
    configTypesEnum: 'List',
    configTypesBoolean: 'Checkbox',
    configTypesDate: 'Date',
    configTypesSeparator: 'Group',

    configVisibilityHidden: 'Hidden',
    configVisibilityVisible: 'Visible',
    configVisibilityHiddenWhileEmpty: 'Hidden while empty',

    alertCantLoadData:
      "Can't load custom fields data. Please try again. Contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats.",

    title: 'Custom Fields Schema',
    textReorder: 'To reorder drag and move',

    inputPlaceholderEnterTitle: 'Enter title',
    textButtonDelete: 'Delete',
    textButtonCancel: 'Cancel',

    textErrorTitleEmpty: '"Title" - is empty',
    textErrorTitleTaken: 'The "Title" you\'ve entered is already taken',
    textErrorDbCant: "db can't handle it",

    // textFieldEmpty: 'Field {field} is empty.',
    textErrorTitleName: 'Only letters, numbers, underscore and dash are allowed',
    textErrorTitleNameSpace: 'Only letters, numbers, underscore, dash, and space are allowed',
    textErrorComma: "Can't set comma in options name, please use another sign",

    type: 'Type',
    createGroup: 'Create New Group',
    createField: 'Create New Custom Field',
    editGroup: 'Edit Group',
    editField: 'Edit Custom Field',
    edit: 'Edit',

    labelName: 'Name',
    placeholderName: 'Enter Name',
    captionName: 'Use Latin characters, do not put spaces and punctuation.',
    labelDescription: 'Description',
    placeholderDescription: 'Enter Description',
    addNewItem: 'Add new item',
    btnSave: 'Save',
    btnAdd: 'Add',

    uploadText: 'Select your .picsioconf for upload.',
    btnSubmit: 'Import scheme',
    btnExport: 'Export',
    btnImport: 'Import',
    textImportError: () => (
      <div>
        Can't import schema. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    textMoveFieldError: () => (
      <div>
        Can't move custom field. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    deleteWarning: {
      title: 'Restricted custom field detected',
      text:
        "You're about to delete the required custom field for uploads and revisions. Are you sure you want to complete this action?",
    },
    changeTypeWarningDialog: {
      title: 'Warning',
      text: 'Values for this custom field were set for some assets. Do you want to proceed with changing the field type and reset those values for all assets?',
      textBtnOk: 'Reset values',
    },
    changeTypeLimitDialog: {
      title: 'Error',
      text: 'Changing the type of the field will affect too many assets which may cause performace and data integrity issues. To prevent this, we change field types only via our support engineers',
      textBtnOk: 'Write to support',
    },
  },

  DOWNLOADDIALOG: {
    titleDownload: 'Download',
    labelQuality: 'Quality',
    labelSize: 'Size',
    labelPixels: 'Pixels',
    labelResolution: 'Resolution',
    labelUnits: 'Units',
    labelDownloadAs: 'Download as an archive',
    labelDownloadWithoutWatermark: 'Download without watermark',
    labelOrganizeBy: 'Organize files by collections',
    textDownload: 'Download',

    textAsOriginal: 'As original',
    textLargestSide: 'largest side',
    textWidth: 'width',
    textHeight: 'height',

    tooltipOrganize: 'To choose this option, check “Download as an archive” first.',

    errorCantCreateArchive:
      "Can't create an archive. Please try again later or contact support@pics.io.",
    errorDownloading:
      "Assets weren’t downloaded. Please try again. If the error still appears please contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a>",
    getDownloadPresetError:
      "Can't get download preset list.<br> Please try again later or contact support@pics.io.",
    createDownloadPreset: 'Create download preset',
    saveDownloadPreset: 'Save download preset',
    saveDownloadPresetError:
      "Can't save download preset.<br> Please try again later or contact support@pics.io.",
    removeDownloadPreset: 'Remove download preset',
    removeDownloadPresetText: (presetName) => `You are about to delete ${presetName} preset`,
    removeDownloadPresetError:
      "Can't remove download preset.<br> Please try again later or contact support@pics.io.",
  },

  DIRECT_LINK_DOWNLOAD_DIALOG: {
    TITLE: () => 'Download by direct link',
    TEXT: (assets, urls, logger) => (
      <div>
        {pluralize('This', assets.length, false)} {pluralize('file', assets.length, false)}{' '}
        {pluralize('is', assets.length, false)} over 40MB and can be dowloaded only via a web link:{' '}
        <br />
        <ul className="simpleList">
          {assets.map((asset, index) => (
            <li key={asset._id}>
              <a
                href={urls[index]}
                onClick={() => logger(asset._id, asset.fileSize)}
                download={asset.name}
              >
                {asset.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    ),
    errorText: "Can't get a link for direct download.",
  },

  DOWNLOAD_PANEL: {
    titleDownloading: 'Downloading',
    textRetry: 'Retry',
    textCancel: 'Cancel',
    titleDialogConfirm: 'Confirm',
    btnOkDialogConfirm: 'Sure',
    textDialogConfirm: 'Are you sure to remove all files from download',
    btnRemoveAll: 'Remove all',
    textFilesLeft: 'files left',
    textTotal: 'Total: ',
    textDownloadingComplete: 'Download is complete',
    textDownloaded: 'downloaded',
    textDownloadingProgress: 'files, downloading in progress',
  },

  HISTORY: {
    textPostComment: 'Post a comment to start a discussion.',
    textPlaceholderGuest: 'Guest',
    textPlaceholderAddComment: 'Add comment',
    textShowMarkers: 'Show markers',
    textHideMarkers: 'Hide markers',
    textCopyLink: 'Copy link',
    textDeleteComment: 'Delete comment',
    textCopiedLink: 'Link copied',
    textDownloadRevision: 'Download revision',
    textMetadataUpdated: 'Asset metadata updated',
    textTechnicalRevision: 'technical revision',
    textSeeDifference: 'See the difference',
    textShowAllMarkers: 'Show all markers',
    textHideAllMarkers: 'Hide all markers',
    textRevertRevision: 'Set as current revision',
    textNoteRemovedSuccess: 'Your revision was successfully removed',
    textNoteRemovedWasnt: "Your revision wasn't removed. Please try a bit later",
    textNoteLoadedWasnt: "Your revision wasn't loaded. Please try a bit later",
    textRevisionLoading: 'Revision is loading...',
    switchDialogTitle: 'Warning',
    switchDialogText: 'This marker(s) belongs to a different revision. <br />Switch revisions?',
    switchDialogOk: 'Ok',
    switchDialogCancel: 'Cancel',
    tooltipAddMarkers: 'Click to add new marker',
    tooltipAddMarkersLocked: 'You can add markers to the latest version only',
    initialRevisionDialogText:
      'This revision is unavailable since it’s deleted from your cloud storage',
    textInitialRevision: 'Initial revision',
    approved: 'approved',
    disapproved: 'disapproved',
    titleDialogError: 'Error',
    addMarker: 'Add marker',
    approve: 'Approve',
    proofingCommentsPlaceholder: 'No comments yet',
    textCommentDeleted: 'comment deleted',
    textErrorDeletingComment: "Your comment wasn't deleted. Please try a bit later",
    textErrorRevertRevision: "Your revision hasn't been set as current. Please try again later.",
    switchDialogTitleError: 'Error',
    textCantShowRevisionButDownload:
      'Unfortunately, revisions for this file format can’t be displayed. But you still may download it from the Activity panel.',
    textCantShowRevision:
      'Sorry, Pics.io can\'t fulfill this request. Please contact us at <a class="picsioLink" href="mailto:support@pics.io">support@pics.io<a>',
    textRevisionAdded: (revisionNumber) => (
      <span className="revisionText">
        added{' '}
        <span className="revision">
          revision <span className="revisionNumber">{revisionNumber}</span>
        </span>
      </span>
    ),
    textRevisionIsACopyOf: (revisionNumber) => (
      <span className="revisionCopyText">
        (copy of <span className="revision">revision</span>{' '}
        <span className="revisionNumber">{revisionNumber}</span>)
      </span>
    ),
  },

  HOTKEYS: {
    actionSelectDeselect: '(de)select all',
    actionImportpanel: 'upload panel',
    actionTreeCollections: 'tree collections',
    actionInfopanel: 'info panel',
    actionSearch: 'search',
    actionDialogHotkeys: 'dialog hotkeys',
    actionScrollUp: 'Scroll up',
    actionScrollDown: 'Scroll down',
    actionScrollUpPage: 'Scroll up one page',
    actionScrollDownPage: 'Scroll down one page',
    actionScrollToBegining: 'Scroll to the beginning of a catalogue',
    actionScrollToEnd: 'Scroll to the end of a catalogue',

    actionMassDownload: 'mass download',
    actionFlagApprove: 'flag approve',
    actionFlagReject: 'flag reject',
    actionUnflag: 'unflag',
    actionRating: 'rating 1-5',

    actionColorRed: 'color red',
    actionColorYellow: 'color yellow',
    actionColorGreen: 'color green',
    actionColorBlue: 'color blue',
    actionColorNone: 'color none',

    actionPrevImg: 'previous asset',
    actionNextImg: 'next asset',
    actionClosePreview: 'close preview',
    actionHistorypanel: 'activity panel',

    actionSelectOneAsset: '(de)select one asset',
    actionSelectSomeAssets: '(de)select random assets',
    actionSelectRangeAssets: '(de)select assets in sequence',
  },

  KEYWORDSTREE: {
    title: 'Keywords',
    sortByAlphabetEl: 'Sort by name',
    sortByDateEl: 'Sort by last used',
    sortByHotEl: 'Sort by most used',

    textPlaceholderText: "You haven't created any keywords yet",
    placeholderNewKeyword: 'Keyword name',
    textButtonCreate: 'Create new',

    inputPlaceholderSearch: 'Search keywords',

    textTooltipCreate: 'Create keyword',
    textTooltipCreateSub: 'Create sub-keyword',
    textTooltipDelete: 'Delete keyword',
    textTooltipDeleteKeywords: (count) => `Delete selected ${pluralize('keyword', count)}`,
    textTooltipRename: 'Rename keyword',
    textTooltipRemove: 'Remove from favorites',
    textTooltipAddToFavorites: 'Add to favorites',
    textTooltipMerge: 'Merge selected keywords into this keyword',

    errorKeywordsDeleting: () => (
      <>
        Can't delete keywords. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </>
    ),

    errorKeywordMerging: () => (
      <>
        Can't merge selected keywords. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </>
    ),

    textTitleGenerateKeywords: 'Generate keywords',
    textTextGenerateKeywords: 'You are about to generate keywords for all assets in your library.',
    textGenerate: 'Generate',
    textEnoughCredits: 'Unfortunately you have not enough credits to autofill keywords.',
    textGenerationgInBackground:
      'Keywords are generating in background... Refresh page in few minutes.',
    textAskTeamowner: ' Please ask your team owner / billing manger to buy credits.',
    textGoToBillingpage: ' Please go to billing page to buy credits.',
    textOpenBilling: 'Open Billing',

    tooltipEditOn: 'Enter in edit mode',
    tooltipEditOff: 'Exit from edit mode',
  },

  TREE_PLACEHOLDER: {
    createNew: 'Create new',
    enterNewName: 'Enter new name',
  },

  DETAILS: {
    tooltipReplicatorRunning: 'This asset metadata is not synchronized with Cloud Storage Account',
    tooltipKeywordingWaiting: 'Waiting to parse keywords',
    tooltipKeywordingRunning: 'Parsing keywords',
    tooltipKeywordingError: 'Failed to parse keywords',
    tooltipMetadatingWaiting: 'Waiting to parse metadata',
    tooltipMetadatingRunning: 'Parsing metadata',
    tooltipMetadatingError: 'Failed to parse metadata',
    autogenerateError: 'Not sufficient funds',

    tooltipLock: (param) => `${param} details panel for editing`,
    tooltipGenerateKeywords: 'Generate keywords',

    textLock: 'Lock',
    textUnlock: 'Unlock',
    textUnlockAlways: 'Always unlock',
    textUnlockLogout: 'Unlock until logout',
    textLockAlways: 'Always lock',

    textDownload: 'Download',
    textDuplicate: 'Duplicate',
    textExportToCSV: 'Export CSV',
    textDelete: 'Move to trash',
    textDeleteForever: 'Delete forever',
    textRename: 'Rename',

    textNoFiles: 'No assets',
    textSelectedAll: 'Select all',
    textDeselectAll: 'Deselect all',
    textDownloadFiles: 'Download assets',
    textAssetsInCollection: 'assets in collection',
    textAssetFound: 'asset found',
    textAssetsFound: 'assets found',
    textNoAssets: 'There are no files in this collection',
    textAssetDuplicateFail: 'Failed to duplicate',

    textSelectedFiles: (collectionLength) => `Selected ${collectionLength} assets`,
    placeholderMultipleSelection: 'Multiple selection',
    placeholderMultipleSelectionRestricted: 'Restricted assets selected',
    placeholderEnterTitle: 'Enter title',
    placeholderUneditabledTitle: 'Title',
    placeholderEnterDescription: 'Enter description',
    placeholderUneditabledDescription: 'Description',
    textTitleAndDescription: 'Title & Description',
    textProcessing: 'Processing',
    textKeywordsSuccess: 'Keywords successfully attached',
    textCantUpdateKeywords: () => (
      <div>
        Can't update keywords. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    textCantUpdateAssignees: (length) => (
      <div>
        Can't update {pluralize('assignee', length)}. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    textCantUpdateAssetName: () => (
      <div>
        Can't update asset name. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    textCantRemoveAsset: (length) => (
      <div>
        Can't remove {pluralize('asset', length)}. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    textCantDeleteAsset: (length) => (
      <div>
        Can't delete {pluralize('asset', length)}. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    textCantRestoreAsset: (length) => (
      <div>
        Can't restore {pluralize('asset', length)}. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    textCantSetSingleAssetSettings: () => (
      <span>
        Can't change asset settings. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </span>
    ),
    textKeywords: 'Keywords',

    titleGenerating: 'Generating...',
    textKeywordsGeneration: 'Keywords generation is in process',
    titleNotEnoughtCredits: 'Not enough credits',
    textNotEnoughtCredits: 'Unfortunately you have not enough credits to autofill keywords.',
    textNotEnoughtCreditsForKeywording: (onClickHandler) => (
      <div>
        You have reached the limit for the first free 1000 images with autokeywording. To use
        autokeywording feature further, please{' '}
        <span className="picsioLink" onClick={onClickHandler}>
          {' '}
          buy more API calls{' '}
        </span>{' '}
        to your Pics.io account balance{' '}
      </div>
    ),
    textReachedAutokeywordingLimit: (onClickHandler, canNotBuyApiCalls, usersToWrite) => (
      <>
        You've reached the limit for autokeywording. Please,{' '}
        <Choose>
          <When condition={canNotBuyApiCalls}>
            <>ask the team admins {usersToWrite.map((user) => (
              <Tag
                type="user"
                avatar={user.avatar}
                key={user._id}
                text={user.email}
              />
            ))} to buy more API calls to continue using AI tagging.
            </>
          </When>
          <Otherwise>
            <>
              <span className="picsioLink" onClick={onClickHandler}>
                buy more API calls
              </span>{' '}
              to your Pics.io account balance.
            </>
          </Otherwise>
        </Choose>
      </>
    ),
    textCantAutokeywordingForSelectedAssets: (
      onClickHandler,
      canNotBuyApiCalls,
      usersToWrite,
      assetsLengthAllowedToKeywording,
    ) => (
      <>
        The amount of assets selected for autokeywording exceeds your current limit. Please select
        up to {assetsLengthAllowedToKeywording} assets or{' '}
        <Choose>
          <When condition={canNotBuyApiCalls}>
            <>please ask the team admins {usersToWrite.map((user) => (
              <Tag
                type="user"
                avatar={user.avatar}
                key={user._id}
                text={user.email}
              />
            ))} to buy more API calls to continue using AI tagging.
            </>
          </When>
          <Otherwise>
            <>
              <span className="picsioLink" onClick={onClickHandler}>
                buy more API calls
              </span>{' '}
              to your Pics.io account balance.
            </>
          </Otherwise>
        </Choose>
      </>
    ),
    textOpenBilling: 'Open Billing',

    textAskTeamowner: ' Please ask your team owner / billing manager to buy credits.',
    textGoToBillingpage: ' Please go to billing page to buy credits.',
    titleError: 'Error',
    textServiceUnavailable: 'This service is unavailable now. Please try again later.',
    textAssignees: 'Assignees',
    textShare: 'Share',
    textShareLink: 'Sharing link',
    textDirectLink: 'Direct URL for embedding',
    textRestrict: 'Restrict',
    textCollections: 'Collections',
    textLightboards: 'Lightboards',
    textCustomFields: 'Custom fields',
    titleArchive: 'Archive',
    titleWatermarks: 'Watermarks',
    labelArchiveReason: 'Archived asset reason message',
    defaultArchiveReason: 'Asset is moved to archive',
    titleRemove: 'Remove',
    textRemoveFilesFromCollection: 'Remove assets from collection',
    textFinishInBg: 'This operation affects large amount of assets and will finish in background.',
    textRemoveFilesFromLightboardAndDelete:
      'This operation will delete assets that do not belong to any lightboard and/or collection.',
    textRemoveFilesFromLightboard: (assetsCount) => `Remove ${assetsCount > 1 ? assetsCount : ''} asset${
      assetsCount > 1 ? 's' : ''
    } from lightboard`,
    textCantUpdateTags:
      'Can\'t update tag(s). Please try again. Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
    textCantUpdateLightboards:
      'Can\'t update lightboard(s). Please try again. Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
    textAssetMarks: 'Asset marks',
    titleConfirm: 'Confirm',
    titleWarning: 'Warning!',
    textAreYouSure: (value) => `You’re about to change ${value} of assets. Are you sure?`,
    textAreYouRealySure:
      'You have selected more than 50 000 assets. It is not possible to make changes on them at once.<br><br>If you still want to proceed with updating information on more than 50 000 files, please contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> for further assistance.',
    textCantUpdate: (value) => (
      <div>
        Can't update ${value}. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    textDetachFromCollectionSomeAssetsFailed: ({ count, collection }) => (
      <div>
        For some reason {count} assets failed to remove from collection "{collection}". Please try
        again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    textDetachFromLightboardSomeAssetsFailed: ({ count, lightboard }) => (
      <div>
        For some reason {count} assets failed to remove from lightboard "{lightboard}". Please try
        again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),

    textRejectedFiles: 'Rejected assets',
    textUnflaggedFiles: 'Unflagged assets',
    textFlaggedFiles: 'Flagged assets',
    textLabeledRed: 'Labeled "red"',
    textLabeledYellow: 'Labeled "yellow"',
    textLabeledGreen: 'Labeled "green"',
    textLabeledBlue: 'Labeled "blue"',
    textLabeledPurple: 'Labeled "purple"',
    textNoColorLabel: 'No color label',
    textMoveToTrash: 'Move to trash',

    panelPlaceholderNoLabels: 'No label is attached to this asset',
    panelPlaceholderNoKeywords: 'No keyword is attached to this asset',
    panelPlaceholderNoUsers: 'No teammate is assigned to this asset',
    panelPlaceholderAssetNoCollections: 'This asset doesn’t belong to any collection',
    panelPlaceholderAssetsNoCollections: 'These assets don’t belong to any collection',
    panelPlaceholderNoCoordinates:
      'To see the map, please specify GPSLatitude and GPSLongitude in the list of EXIF metadata fields.',
    panelPlaceholderNoLightboards: 'This asset doesn’t belong to any lightboard',
    mixedField: 'You lack permission to edit some of selected files',

    labelCheckboxDontShow: "Don't show again",

    editWidgets: 'Edit widgets',

    titleArchiveAssets: 'Move to archive',
    textArchiveAssets: (amount) => `You are about to archive ${amount} asset(s)`,
    textCopy: 'Copy',
    textInviteTeammates: 'Invite people to collaborate',
    textRequestDemo: 'Request a demo',
    messageCopied: 'Copied to clipboard',
    sharedAssetsUrlCopied: 'Url of the shared asset has been copied',
    websiteUrlCopied: 'Website\'s URL has been copied',
    brandPageUrlCopied: 'Brand page URL has been copied',
    apiKeyCopied: 'API Key has been copied',
    referralLinkCopied: 'Referral link URL has been copied',
    inboxUrlCopied: 'Inbox\'s URL has been copied',
    disabledCopyWebsitesTooltipText: 'Publish a website to enable this link',
    disabledCopyInboxTooltipText: 'Publish a inbox to enable this link',
    disabledCopyAssetsTooltipText: 'Publish asset sharing to enable this link',

  },

  RESTRICT: {
    RESTRICTED_REASON: 'Asset is restricted. Use with caution',
    restrictReasonLabel: 'Reason for asset restriction',
    attachAssetToCollection:
      'You are planning to move the restricted asset. You do not have permission to move it. Please select only non restricted assets to perform this action.',
    attachAssetsToCollection:
      'Some of the assets you are planning to move are restricted. You do not have permission to move them. Please deselect restricted assets and try again.',
    cantRestrict: (length) => (
      <div>
        Can't restrict {pluralize('asset', length)}. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
  },

  LinkedAssets: {
    title: 'Linked assets',
    buttonLinkAssets: 'Link assets',
    buttonUnlinkAssets: 'Unlink selected',
    textNoLinkedAssets: 'no linked assets',
    titleUnlinkFrom: 'Unlink all assets',
    titleUnlink: 'Unlink this asset',
    infoAlreadyLinked: 'All selected assets are already linked',
    infoAlreadyUnlinked: 'All selected assets are already unlinked',
    placeholder: (allowedAssetsCount) => `Sorry, you can’t link more than ${allowedAssetsCount} assets at a time.`,
    errorMessage: "can't get selected assets, please try again",
  },

  RESOLVEDUPLICATESDIALOG: {
    titleFileAlreadyExists: 'Asset already exists',
    textKeepBoth: 'Keep both',
    textAddAsNewRevision: 'Add as a new revision',
    textReplace: 'Replace',
    textRename: 'Rename',
    textSkip: 'Skip',
    textApplyToAll: 'Apply to all',
    textFileAlreadyExists: 'You’re about to upload the asset that already exists in Pics.io',
  },

  EXPORT_TO_CSV_DIALOG: {
    title: 'Export as CSV',
    textBtnCancel: 'Cancel',
    textBtnOk: 'Export',
    noPermissions: 'Access denied',
    validationError: 'Validation error',
    fileName: 'assets_data.csv',
    exportAllFields: 'All fields',
    exportSelectedFields: 'Select required fields',
    notAvailable: {
      title: 'Feature is not available',
      text: 'This feature is not available on mobile devices.',
      textBtnCancel: 'Ok',
    },
    assetsLimit: {
      title: 'Attention!',
      text: (assetsLimit) => `Currently, it’s not possible to export more than ${assetsLimit} assets at once.<br />Please select less or contact us at <a class='picsioLink' href='mailto:support@pics.io'>support@pics.io</a> if you still want to proceed.`,
      textBtnCancel: 'Ok',
    },
  },

  REVISION_FIELDS_DIALOG: {
    title: 'Required fields',
    textBtnCancel: 'Cancel',
    textBtnOk: 'Upload',
    labelCommentRevision: 'Comment revision',
    labelTitleAndDescription: 'Title & Description',
    labelKeywords: 'Keywords',
    labelAssignees: 'Assignees',
    labelAssetMarks: 'Asset marks',
    description: (action) => `According to team policy, you are required to ${action} every time you upload a new revision.`,
    titles: {
      comments: 'Add a comment',
      titleAndDescription: 'Add title and description',
      keywords: 'Attach keywords',
      assignees: 'Assign users',
      flag: 'Set flag',
      rating: 'Set rating',
      color: 'Set color',
    },
  },

  SEARCH: {
    text: {
      // keep keys in alphabetical order
      asset: 'asset',
      assets: 'assets',
      'Click to add custom field': 'Click to add custom field',
      'Click to add keywords': 'Click to add keywords',
      Color: 'Color',
      'Custom field': 'Custom field',
      Flag: 'Flag',
      Keywords: 'Keywords',
      'Last changed': 'Last changed',
      'Learn more': 'Learn more',
      'No assets': 'No assets',
      Rating: 'Rating',
      Reset: 'Reset',
      'Save this search': 'Save this search',
      Search: 'Search',
      'Search in': 'Search in',
      'Select custom fields': 'Select custom fields',
      Type: 'Type',
      'Upload date': 'Upload date',
      Restricted: 'Restricted',
      'Restricted show': 'Show restricted assets under search results',
      showArchivedAssets: 'Show archived assets',
    },

    fieldAny: 'All fields',
    fieldName: 'Filename',
    fieldContent: 'Content',
    fieldCollectionName: 'Collection name',
    fieldTitle: 'Title',
    fieldDescription: 'Description',
    fieldKeywords: 'Keywords',
    fieldMeta: 'Custom fields',

    optionAny: 'Any',
    optionImages: 'Images',
    optionVideo: 'Video',
    optionAudio: 'Audio',
    optionText: 'Text documents',
    optionPDF: 'PDF documents',
    optionSketch: 'Sketch files',
    optionRAW: 'DSLR RAW photos',
    optionPhotoshop: 'Photoshop documents',
    option3D: '3D models',

    dialogTitleCreateSearch: 'Create saved search',
    dialogCreateSearchLabel: 'Name',
    dialogCreateSearchLabelShare: 'Share with my team',
    dialogErrorNameEmpty: 'Name is empty',
    dialogTitleSearchHaveAlready: 'Sorry',
    dialogTextSearchHaveAlready:
      'This name is already used for saved search. Try another name, please.',
  },

  COMPARE: {
    wrongParameters: {
      title: 'Sorry, comparison failed',
      text: 'Please check the parameters of your assets and try again',
    },
  },

  REFERRAL: {
    title: 'Referral page',
  },

  STORAGE: {
    title: getStorageTitle,
    alertCantLoadStat:
      "Can't load storage statistics. Please try again. Contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats.",
    textConnectedTo: (email) => `Connected to <span class='pageStorageMail__mail'>${email}</span> storage`,
    textFolderConnectedTo: ({ name, linkToGoogleDriveFolder, storageType }) => (storageType === 's3'
      ? `Connected to ${name}</a> folder`
      : `Connected to <a class="picsioLink" href=${linkToGoogleDriveFolder} target=\'_blank\'>${name}</a> folder`),
    textSizeTotal: (size, storageType) => (storageType === 's3'
      ? `Amazon S3 <span>(${size} total)</span>`
      : `Google Drive <span>(${size} total)</span>`),
    textGDSizeUnlimited: 'Google Drive <span>(Unlimited)</span>',
    textUsed: 'used',
    textUsedWithoutTrash: 'used (without trashed)',
    textFree: 'free',
    textTrashed: 'trashed',
    textChange: 'Change',
    textAvailable: 'available',
    textCreditsBuySuccess: (amount) => `You have successfully purchased ${amount} keyword calls`,
    textRequestMoreStorage: 'Request more storage',
    textLabelMigration: 'Your plan also allows you to use other storage:',
    textRequestMigrationGD: 'Request migration to Google Drive',
    textRequestMigrationS3: 'Request migration to Amazon S3',
    textMigrationRequestSent: () => <span>Your request for migration has been sent. <br /> We will contact you soon.</span>,
    textChangeStorage: 'Reset storage',
    resetingStorage: 'Reseting storage',
    alertCantReset:
      "Can't reset storage. Please try again. Contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats.",
    DIALOG_RESET_STORAGE: {
      title: 'Reset Confirmation Required',
      text: 'Reseting a storage will result in removing all assets, collections, keywords, inboxes, and websites created until now.',
      textBtnOk: 'Reset storage',
    },
  },
  SYNC: {
    screenTitle: 'Sync Settings',
    textLoading: 'Loading sync settings...',
    textTitleCantStartSync: 'Sync is not available now',
    textTextCantStartSyncTemplate: (progress) => `Wait a sec, please. It seems that sync is currently in ${progress}% progress.`,
    textManualSyncLimited: (minutesBeforeNextSync) => `For your current Pay as you go plan next sync will be available in ${minutesBeforeNextSync} minutes. Upgrade your billing plan and make your storage sync automatically.`,
    textTitleSyncFailed: 'Sync failed',
    textTextSyncFailed:
      "Sync failed. Please contact <a href='mailto:support@pics.io?subject=Sync from GD failed'>support@pics.io</a>.",
    textTitleSyncStarted: 'Sync has started',
    textTextSyncStarted: 'Sync has started in the background. This may take a while.',
    textTitleSyncRunning: 'Sync is running',
    textTextSyncRunning:
      'Sync process takes more time than expected, we will notify you by email about sync status.',
    textTitleSyncCancelled: 'Attention!',
    textTextSyncCancelledTemplate:
      'Sync cancelled.<br /><br />This sync will remove a lot of assets from your digital library. If you are aware of that & want to proceed with sync, press OK.',
    textTextSyncDestructiveWebsitesTemplate: (websites) => `Sync process was cancelled because websites that will be removed by sync were found: ${websites} <br/> To fix this, please, do one of the following:<br/> - rename pics.io collections so they match your Cloud Storage folder names<br/> - rename your Cloud Storage folders so they match pics.io collections<br/> - run 'Sync to your Cloud Storage'<br/> - once unshare your collections<br/><br/>`,
    textTitleSyncNothing: 'Nothing to sync',
    textTextSyncNothing:
      'It seems connected folder in your Cloud Storage is empty. To import your assets into Pics.io please put them inside connected folder or its subfolders.',

    textTitleGDS: 'Cloud Storage syncronization',
    textButtonSync: 'Sync',
    textButtonGoToGD: 'Go to your Cloud Storage',
    labelSyncToPicsio: 'Sync from your Cloud Storage to Pics.io',
    descriptionPull: 'Pull all folders and files changes from your Cloud Storage working folder',
    labelSyncToGD: 'Sync from Pics.io to your Cloud Storage',
    descriptionPush: 'Push collections and assets changes to your Cloud Storage working folders',

    textSyncingData: 'Syncing data...',
    textSyncFailed: 'Sync failed',

    errorWrongAccount: 'Wrong user account',
  },

  TAGSTREE: {
    errorSomethingWrong:
      "Something went wrong. Please try again. Contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats.",
    textRemoveCollectionAndSite: (collectionName, websiteAlias) => `You are about to delete collection <span class='highlight'>${collectionName}</span> and all the nested subcollections from Pics.io<br /> ${
      websiteAlias
        ? `This operation will also remove website <a href='${websiteAlias}' target='_blank'>${websiteAlias}</a><br />`
        : ''
    } <br /><span class='highlight'>Attention!</span> The assets will be deleted from all the collections and/or lightboards they may be attached to and will be moved to Trash`,
    textRemovingCollection: 'Removing collection...',
    textRemovingFilesInGD: 'Removing files in your Cloud Storage...',
    errorNameEmpty: 'Name is empty',
    errorNameAlreadyTaken:
      'This name is already taken at the current level. Please, enter another one',
    alertSearchAdded: (name) => `"${name}" has been added to "Saved searches"`,
    textDeleteCollection: 'Delete collection',
    textCreateCollection: 'Create collection',
    textCreateNestedCollection: 'Create nested collection',
    textRenameCollection: 'Rename collection',
    textUploadFiles: 'Upload assets',
    textCopyWebsiteLink: 'Copy website link to clipboard',
    textRemoveFromFavorites: 'Remove from favorites',
    textAdToFavorites: 'Add to favorites',
    textMoveCollection: 'Move collection',
    textDownloadCollection: 'Download collection',
    textSave: 'Save',
    textCancel: 'Cancel',
    textSyncFolder: 'Run sync',
    textUpdateWebsite: 'Website settings',
    textCreateWebsite: 'Publish to web',
    textRemoveCollection: 'Delete collection',
    textRemoveFilesFromGD: 'Also remove nested assets',
    textCantChangeOrder: () => (
      <div>
        Can't change sort order. Please try again. Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    textCantCompleteSearch: () => (
      <div>
        Can not complete search for collections. Please try again. <br />
        Contact{' '}
        <a className="picsioLink" href="mailto:support@pics.io">
          pics.io
        </a>{' '}
        support if the error repeats.
      </div>
    ),
    titleRemoveSavedSearch: 'Remove saved search',
    textYouAreAboutRemoveSavedSearch: (name) => `You are about to remove saved search <span class="highlight">${name}</span>. Continue?`,
    textHasBeenRemoved: (name) => `"${name}" has been removed from "Saved searches"`,
    placeholderSearch: 'Search collections',
    textAttachingCollection: 'Attaching collection',
    textAttachingToCollection: 'Attaching to collection',
    textDetachingCollection: 'Detaching collection',
    textMovingCollection: 'Moving collection...',
    textMovedCollection: 'Collection moved',
    textCollectionNotSelected: 'Collection not selected',
    textUnableToMoveCollection: (errorMessage) => `Unable to move collection. ${errorMessage}`,
    textMoveToArchive: 'Move to archive',
  },

  SAVEDSEARCHESTREE: {
    placeholderSearch: 'Search in saved searches',
    textDeleteSearch: 'Delete saved search',
    textFavorites: 'Favorites',
    textAddToFavoritesSearch: 'Add to favorites',
    textRemoveFromFavoritesSearch: 'Remove from favorites',
    textSavedSearches: 'Saved Searches',
    textPlaceholderText: "You haven't saved any search<br> results yet",
  },

  LIGHTBOARDSTREE: {
    title: 'Lightboards',
    placeholderSearch: 'Search lightboards',
    textDeleteLightboard: 'Delete lightboard',
    textErrorTitleNameSpace: 'Only letters, numbers, underscore, dash, and space are allowed',
    placeholderNoLightboard: "You haven't created any lightboards yet",
    textUploadFiles: 'Upload assets',
    textRenameLightboard: 'Rename lightboard',
    textCreateLightboard: 'Create lightboard',
    textSave: 'Save',
    textCancel: 'Cancel',
    errorUnableToRename: 'Unable to rename lightboard. Please, contact support@pics.io',
    textAttachingToLightboard: 'Attaching to lightboard',
  },

  INBOXESTREE: {
    title: 'Inboxes',
    placeholderSearch: 'Search inboxes',
    textDeleteInbox: 'Delete inbox',
    textErrorTitleNameSpace: 'Only letters, numbers, underscore, dash, and space are allowed',
    placeholderNoInbox: "You haven't created any inbox yet",
    textUploadFiles: 'Upload assets',
    textRenameInbox: 'Rename inbox',
    textCreateInbox: 'Create inbox',
    textSave: 'Save',
    textCancel: 'Cancel',
    errorUnableToRename: 'Unable to rename inbox. Please, contact support@pics.io',
    textCopyInboxLink: 'Copy inbox link to clipboard',
    textInboxSettings: 'Inbox settings',
    textDelete: 'Delete inbox',
    textRename: 'Rename inbox',
  },

  INBOXSETTINGS: {
    title: 'Inbox settings',
    share: 'Share inbox',
    unshare: 'Stop sharing inbox',
    textMain: 'Main',
    textSecurity: 'Security',
    textPassword: 'Password',
    startShare: 'Share inbox',
    stopShare: 'Stop sharing inbox',
    textUrlNotValid: 'URL is not valid',
    textWordsCantBeUsed: (words) => `Words "${words}" can\'t be used at the url begging`,
    textPasswordConfirm: 'Password and confirm password are not equal',
    DEFAULT_FIELDS: {
      comment: 'Comment',
      titleAndDescription: 'Title & Description',
      flag: 'Flag',
      rating: 'Rating',
      color: 'Color',
    },
    ERRORS: {
      cantGetInboxes: 'Inboxes has not loaded. Try refreshing the page to see them.',
      cantChangeAlias: 'Can not change inbox alias',
      cantAddCustomField: 'Can not add custom field to inbox',
      cantRemoveCustomField: 'Can not remove custom field from inbox',
    },
  },

  WATERMARKS: {
    errorNameEmpty: '"Name" - is empty',
    dialogTextWatermarkHaveAlready: 'The watermark with such name already exists. Please try the other name.',
    titleNewWatermark: 'New watermark',
    titleDeleteWatermark: 'Delete this watermark?',
    titleUpdateWatermark: 'Update this watermark?',
    titleAttachWatermark: (value) => `You have selected ${value} assets. Watermark will be laid only on JPG, JPEG, PNG formats.`,
    titleDetachWatermark: (value) => `Watermark will be removed from ${value} assets.`,
    applyWatermark: 'Apply this watermark?',
    removeWatermark: 'Remove this watermark?',
    textUpdateWatermark: (value) => `This watermark is used on ${value} assets. If you make changes to this watermark, they will reflect on those assets immediately.`,
    textDeleteWatermark: (value) => `This watermark is used on ${value} assets. If you delete this watermark, it will get removed from all those assets.`,
    btnOkWatermark: 'Confirm',
    titleEditName: (value) => `Edit "${value}"`,
    textCreateNewWatermark: 'Create new watermark',
    textPlaceholderTypeWatermark: 'Type watermark name here',
    labelSettingsWatermarkName: 'Name',
    labelSettingsWatermarkDescription: 'Description',
    watermarkImageUploadErrorTitle: 'Size or type is incompatible',
    watermarkImageUploadText: 'Image must be transparent PNG only and less than 5MB',
    labelSettingsWatermarkSize: 'Size',
    labelSettingsWatermarkOpacity: 'Opacity',
    labelSettingsWatermarkMakeDefault: 'Make as default',
    errorUpdateWatermark: 'Failed to update watermark',
    errorDeletingWatermark: 'Failed to delete watermark',
    errorWatermarkName: 'Watermark name cannot be empty',
    errorWatermarkText: 'Watermark text cannot be empty',
    makeDefaultWatermark: 'Make default',
    errorMakeWatermarkDefault: 'Failed to make watermark default',
  },

  TEAMMATES: {
    permissionTitleUpload: 'Upload and duplicate assets',
    permissionTitleSync: ({ isSyncAndDisallowedRootCollections, storageType }) => {
      const defaultTitle = storageType === 's3'
        ? 'Synchronize Amazon S3 Bucket with Pics.io'
        : 'Run a sync process for the storage';

      if (isSyncAndDisallowedRootCollections) {
        return 'Synchronization is retricted for users without permissions to manage team collection.';
      }
      return defaultTitle;
    },
    permissionTitleWebsites: 'Create, edit or delete websites, perform single asset sharing',
    permissionTitleManageTeam:
      'Invite or remove other teammates & edit permissions, manage team settings, receive team status emails',
    permissionTitleManageIntegrations: 'Configure an integration with Slack & Webhooks',
    permissionTitleManageBilling:
      'Choose or change subscription plans, add or remove payment methods, edit billing information',
    permissionTitleManageStorage: ({ storageType }) => (storageType === 's3'
      ? 'Change Amazon S3 Bucket & working folder connected to Pics.io'
      : 'Change storage account & a directory connected to Pics.io'),
    permissionTitleCollectionsManage: 'Manage collections',
    permissionTitleCollectionsCreate: 'Create new collections & sub-collections',
    permissionTitleCollectionsMove:
      'Move collection into another one with the same permission enabled',
    permissionTitleCollectionsEdit: 'Rename existing collections & sub-collections',
    permissionTitleCollectionsDelete: 'Delete collections & sub-collections from Pics.io',
    permissionTitleDownloadFiles: 'Download assets from Pics.io',
    permissionTitleEditImageAttributes: 'Manage assets attributes',
    permissionTitleEditAssetFilename: 'Change the filename of an asset',
    permissionTitleEditAssetTitle: 'Change the asset title',
    permissionTitleEditAssetDescription: 'Change the asset description',
    permissionTitleEditAssetKeywords: 'Attach or remove keywords describing an asset',
    permissionTitleAutogenerateKeywords: 'Automatically generate keywords for an asset',
    permissionTitleEditAssetCollections: 'Attach or detach assets to the collections & from them',
    permissionTitleEditAssetAssignees: 'Assign assets to other teammates',
    permissionTitleEditAssetLinkedAssets: 'Create or edit linked assets',
    permissionTitleEditAssetMarks:
      'Change assets marks, including flag status, color labels, star rating, etc.',
    permissionTitleEditAssetMetadata: 'Create, remove or edit custom fields',
    permissionTitleManageKeywords: 'Create, edit or remove keywords & upload controlled vocabulary',
    permissionTitleAddKeywords: 'Add keywords outside of controlled vocabulary',
    permissionTitleManageTeamSavedSearches: 'Add or remove saved searches for the team',
    permissionTitleEditCustomFieldsSchema: 'Create, remove or edit custom fields',
    permissionTitleAllowEditor: 'Use Pics.io image editor',
    permissionTitleDeleteAssets: 'Delete assets from Pics.io library',
    permissionTitleApproveAssets: 'Approve or discard the asset revision',
    permissionManageInboxes: 'Create, configure and delete an inbox',
    permissionAuditTrail: 'See a lof of actions of all teammates ',
    permissionDuplicateAssets: 'Duplicate assets',
    permissionTitleManageWatermarks: 'Manage watermarks',
    permissionTitleCreateDeleteEditWatermarks: 'Create, edit, delete watermarks',
    permissionTitleImportCsv: 'Import csv',
    permissionTitleApplyRemoveWatermarkToAsset: 'Apply, remove from asset',
    permissionTitleDownloadWithoutWatermark: 'Download without watermark',
    textTitleSetPassword: 'Set password',
    textPlaceholderTypePassword: 'Type password here',
    textPlaceholderTypeRole: 'Type role name here',

    title: 'My team',
    tabTeammates: 'Teammates',
    tabRoles: 'Roles',
    tabSettings: 'Settings',
    tabIntegrations: 'Integrations',
    tabBranding: 'Branding',
    tabAnalytics: 'Analytics',
    tabSecurity: 'Security',

    qqcomTitle: 'Error',
    qqcomText:
      'Sorry, you can’t invite users from "qq.com".<br />If you have a reason to do that, please contact us at <a class="picsioLink" href="mailto:support@pics.io">support@pics.io<a>',

    errorEmailEmpty: '"Email" - is empty',
    errorCantAddYourself: "You can't add yourself into your team. Please pick someone else",
    errorEmailInvalid: (email) => `${email} isn't valid`,
    errorHaveReachedLimit: 'You have reached a limit for adding teammates on this plan',

    roleInUse: (users, usersList, usersMore) => (users.length > 1 ? (
      <div className="removeRoleDialog">
        The role can't be removed because it is in use by {users.length} users: {usersList}
        {usersMore}.<br />
        <br /> Please detach the role from those users first.
      </div>
    ) : (
      <div className="removeRoleDialog">
        The role can't be removed because it is in use by {usersList}.<br />
        <br /> Please detach the role from this user first.
      </div>
    )),
    usersWithRole: 'Teammates in',
    noUsersWithRole: 'No users assigned for the role',

    titleDeleteRole: 'Delete this role?',
    textDeleteRole: 'You cannot undo this action and restore the role your are about to delete.',
    btnOkDeleteRole: 'Delete',

    textTitleRemoveTeammate: 'Remove teammate',
    textTeammateWillRemoved: 'Teammate will be removed from the team. Are you sure?',
    textCantRemoveTeammate: "Can't remove teammate",
    textCantConfirmTeammate: "Can't confirm teammate",
    textCantRejectTeammate: "Can't reject teammate",
    textCantUpdateTeammate: "Can't update teammate",

    textPasswordSet: 'Password for teammate successfully set',
    errorCantSetPassword: 'Can not set teammate password',
    errorNameEmpty: '"Name" - is empty',
    titleNewRole: 'New role',
    titleCantRemoveRole: "Can't remove the role",
    textCantRemoveRole: 'The role is in use. Please detach the users from it first.',
    titleWarning: 'Warning!',
    textRemoveOnlyOneRole:
      '<p>Sorry, you can’t do that.</p><p>You must have at least 1 active team role in Pics.io.</p>',
    titleEditName: (value) => `Edit "${value}"`,
    dialogTextRoleHaveAlready: 'The role with such name already exists. Please try the other name.',
    textRemoveAutoinviteRole: (onClickHandler) => (
      <span>
        This role cannot be removed as it’s used as the default one to auto-invite new users. Please{' '}
        <span className="picsioLink" onClick={onClickHandler}>
          choose another role for auto-inviting
        </span>{' '}
        and try again.
      </span>
    ),
    titleRestrictReason: 'Default restricted asset reason message',
    labelRestrictReason: 'Change the default reason message for restricted assets',
    tooltipMessageAllows:
      'Allows the team to use existing keywords only. Blocks any changes, i.e. add, edit and remove keywords.',
    textKeywords: 'Keywords',

    titleRequiredFields: 'Required fields for uploads and revisions',
    labelCommentRequired: 'Comment',
    labelTitleAndDescriptionRequired: 'Title & Description',
    labelKeywordsRequired: 'Keywords',
    labelAssigneesRequired: 'Assignees',
    labelFlagRequired: 'Flag',
    labelRatingRequired: 'Rating',
    labelColorRequired: 'Color',

    labelUseControlled: 'Use controlled vocabulary',
    labelAutofill: (summValue) => `Autofill keywords for new assets. Additional charges will apply - ${summValue} for 1000 items.`,
    textUploadDictionary: 'Upload dictionary',
    textKeywordingLocale: 'Choose a language to generate keywords in:',
    textKeywordingTabTitle: 'Autotagging with keywords',
    textBuyMoreKeywordCalls: 'Buy more calls: ',
    textKeywordingTabControlledVocabularyTitle: 'Generate keywords only from my vocabulary',
    titleInvalidFileType: 'Invalid file type',
    textOnlyTXT: 'You can only upload dictionary as txt file',

    titleUploadDictionary: 'Upload your dictionary',
    labelMerge: 'Merge',
    textAddKeywords: 'Add keywords from the file to your keywords collection.',
    labelReplace: 'Replace',
    textReplaceKeywords: 'Replace your entire keywords collection with keywords from the file.',
    btnUpload: 'Upload',
    titleDictionaryUploaded: 'Upload your dictionary',
    textWeFoundInFile: ({ total, created }) => `In the file we found ${total} keywords, ${created} of them are added to your keywords list.`,
    titleDictionaryUploadFailed: 'Upload of the dictionary failed',
    textErrorTryAgain: 'Error, please try again later',

    titleKeywordsAutogeneration: 'Keywords autogeneration',
    textThisWillCost: 'This action will be charged from your account according to your plan.',
    btnActivate: 'Activate',

    textCreateNew: 'Create new role',
    textTooltipDuplicate: 'Duplicate',
    textTooltipEdit: 'Edit',
    textTooltipDelete: 'Delete',
    textAllowedCollections1: 'Permissions for ',
    textAllowedCollections2: ' collection',
    textNotCreatedAllowedCollection:
      'Teammates with this role have no access to any of your collections in Pics.io.',
    textPressPaperclip: 'Press ‘paperclip’ to choose collections & select permissions.',
    textTeamCollections: 'Collection permissons',
    textPermissions: 'Team Permissions',
    textNoteAllowedCollectionsSelect: () => <>To set similar permissions to several collections, press <code>cmd/ctrl</code> and select several collections, then tick necessary checkboxes. </>,
    learnMoreAboutAllowedCollection: 'Learn more about Collection Permissions',

    textInviteNewTeammate: 'Invite new',
    textNewTeammate: 'New teammate',
    textInvite: 'Invite',
    placeholderEmail: 'email',
    labelSelectRole: 'Select role',
    labelSelectEmail: 'Email (separate multiple email addresses with commas)',
    errorPasswordMin: 'Password needs to be at least 8 characters long',
    errorPasswordMax: 'Password can contain up to 128 characters',

    titleInviteFromEmail: 'Invite from email',
    titleUsersFromGSuite: 'Import user list from Google Workspace',
    textSelectGSuiteUsers: 'Select Google Workspace users to invite',
    addUsersFromGSuite: 'Add users from Google Workspace',
    isPicsioTrusted: () => (
      <span>
        Please check whether Pics.io app is in you Google Workspace trusted apps list.
        <br /> Consult{' '}
        <a
          href="https://help.pics.io/en/articles/1269149-inviting-new-teammates"
          target="_blank"
          className="picsioLink"
        >
          our HelpCenter
        </a>{' '}
        for details
      </span>
    ),
    gSuiteNotAllowed:
      'You are not allowed to invite Google Workspace users to your team. Please activate your Google Workspace account to perform this action.',
    notAuthorizedToGetResourceFromGSuite:
      'Your account does not have sufficient permissions to access Google Workspace users list. Please contact your Google Workspace administrator for authorization to access.',
    reset: 'reset',
    succesfulyInvited: 'Successfully invited:',
    notInvited: 'Not invited:',
    availableUsersExceeded: 'You have exceeded the available number of users.',
    updatePlan: 'Update plan',

    textTeamOwner: 'Team owner',
    textLastVisit: 'Last visit:',
    textNoAnswer: 'n/a',
    labelPassword: 'Password',
    statusInvited: 'Invited',
    statusRequested: 'Requested',
    statusRejected: 'Rejected',
    statusAccepted: 'Accepted',
    statusReinvited: 'Reinvited',
    textStatus: 'status:',
    textClickToReinvite: 'Click to reinvite',

    webhooks: 'Webhooks',
    introWebhooksText:
      'Use webhooks to be notified about events that happen in your Pics.io account.',
    enterUrl: 'Enter url',
    addWebhook: 'Add webhook',
    editWebhook: 'Edit webhook',
    btnAdd: 'Add',
    btnSave: 'Save',
    btnSend: 'Send',
    sendAllTypes: 'Send all event types',
    sendSelectedTypes: 'Select types to send',
    errorUrlNotValid: 'Please enter a valid URL.',
    errorUrlExists: 'This URL is already in use. Please choose another one.',
    testWebhook: 'Test webhook',
    eventType: 'event type',
    testRequestSent: 'Test request has been sent.',
    testRequestNotSent: "Can't send test request. Please try again.",
    tooltipSendTest: 'Send test',
    tooltipEdit: 'Edit',
    tooltipRemove: 'Remove',

    textTitleRemoveWebhook: 'Remove webhook',
    textWebhookWillRemoved: 'Webhook will be removed. Are you sure?',
    textCantCreateWebhook:
      'Can\'t create webhook. Please try again.<br> Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
    textCantRemoveWebhook:
      'Can\'t remove webhook. Please try again.<br> Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
    textCantUpdateWebhook:
      'Can\'t update webhook. Please try again.<br> Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
    learnMoreAboutWebhooks: 'Learn more about webhooks',
    unableToLoadTypes: 'Unable to load event type list',
    descrManageWebhooks: "You don't have permission to create or edit webhooks",
    descrManageApiKey: 'Ask your admin for the permission to view or copy API Key',
    apiKey: 'Your individual API key for integrating Pics.io with Zapier and other services',
    learnMoreAboutZapier: 'How to integrate Pics.io and Zapier',
    copy: 'Copy',

    titleSettingsName: 'Name',
    labelSettingsYourTeamName: 'Your team name',

    labelProfileYourTeamName: 'Your team name',
    labelProfileYourWebsite: 'Website',
    labelProfileYourDomains: 'Company domains',

    titleSettingsDomain: 'Domain',
    placeholderEnterDomain: 'Enter new domain',
    labelEnableAutoInvite:
      'Allow the newly registered users, whose emails contain the above mentioned domain, to join your team',
    labelSettingsYourDomains: 'Your domains',
    labelSetDefaultRole: 'Set default role for new users',

    titleSecurity: 'Security',
    labelAuthentication: 'Activate two-factor authentication for all teammates',
    labelAuthenticationTooltip:
      'Switch on the two-factor authentication for the entire team. Teammates will get an email with instructions.',
    setup2FANow: 'Set up two-factor authentication for my account',
    reset2FASuccess: 'You have successfully reset two-factor authentication for a teammate',
    status2FASuccess: 'Teammate set up two-factor auth',
    status2FAInProgress: 'Teammate is yet to set up two-factor auth',
    status2FAReset: 'Reset',

    BRANDING: {
      logoUploader:
        "It's better to use small square images 200-400 pixels on a transparent background: PNG or SVG. Or small progressive JPG.",
      backgroundUploader: 'The image will be used for login and signup pages.',
      faviconUploader: 'You can use the image 512x512px, best to use a PNG with transparent background',
      titleAccentColor: 'Accent color',
      descriptionAccentColor: 'Use your accent color in the Pics.io UI.',
      titleBackgroundColor: 'Background color',
      descriptionBackgroundColor: 'Use your pages background color in the Pics.io UI.',
      titleAppLogo: 'App logo',
      labelBrandedLogo: 'Enable branded app logo',
      titleCopyright: 'Copyright',
      descriptionCopyright: 'Content will be visible at websites footer',
      titlePages: 'Pages',
      errorSavingSettings:
        'Can\'t save settings. Please try again.<br> Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
      labelBrandedDownloadPage: 'Enable branded download page',
      dialogWarningTitle: 'Warning',
      dialogWrongLoginPath:
        'Do not use the word "login" as you customized login. Please input the other word in this field.',
      errorDomainMessage: (value) => `Domain name ${value} is already used in Pics.io in another account. Please pick a different domain name.`,
    },
  },

  IMPORT: {
    textImagesWasntUploadToGD: "Assets weren't upload to your cloud storage",
    titleFileAlreadyExists: 'Asset already exists',
    textFileAlreadyExists: 'You’re about to upload the asset that already exists in Pics.io',
    textKeepBoth: 'Keep both',
    textAddAsNewRevision: 'Add as new revision',
    textReplace: 'Replace',
    textRetry: 'Retry',
    textRetryAll: 'Retry all',
    textSkip: 'Skip',
    textApplyToAll: 'Apply to all',
    // textUploadedFiles: 'Uploaded {uploadedValue} new assets',

    // textFormatIsntSupported: 'Format ."{fileExtensionValue}" is not supported yet!',
    textFileRevisionUpdated: 'Your asset revision was updated',
    textCantSaveImageToDB: "Can't save uploaded asset into database",
    textCantCheckDuplicates: "Can't check duplicates",
    textCantSaveImageToGD: "Can't save uploaded asset into your cloud storage",
    textCantSaveImageToStorage: "Can't save uploaded asset into storage",
    textDontHavePermissionToUpload: "You don't have permission to upload to this folder",

    corruptedFiles: {
      title: (num) => `${num > 1 ? 'These' : 'This'} file${num > 1 ? 's' : ''} ha${num > 1 ? 've' : 's'} 0 bytes`,
      text: (names) => `File${names.length > 1 ? 's' : ''} ${names.length > 1 ? 'are' : 'is'} corrupted: ${names.join(', ')}
 <br />
 <br />
There is no content to preview in it. Check this file in a software it was generated by`,
    },

    toManyAssetsForAnalysis: {
      title: 'Too many assets selected',
      text:
        '<p>Every time you make a new upload to Pics.io, we check your files for duplicates. Unfortunately, we can’t check more than 10 000 files at a time.</p><p>You can still proceed with uploading. In case of occasional duplicates, we’ll upload them as new assets.</p>',
      textS3:
        '<p>Please note that Pics.io cannot process more than 10 000 assets at a time due to the duplicates check.</p><p>Please select less than 10 000 files at once and perform the action again.</p>',
      btnCancel: 'Cancel',
      btnCancelS3: 'Ok',
      btnOk: 'Continue uploading',
    },

    toManyAssetsForUpload: {
      title: 'Sorry, too many assets processed for upload',
      text:
        '<p>Pics.io is powerful, but apparently, not powerful enough to process so many files at a time.</p><p>Please make a smaller selection for upload. Thanks.</p>',
      btnOk: 'Ok',
    },

    restoreUpload: {
      title: 'Some assets are not uploaded',
      text:
        '<p>For some reason, your latest upload ran into a problem. Some assets were not uploaded to Pics.io.</p><p>Do you want to resume uploading?</p>',
      btnCancel: 'Forget',
      btnOk: 'Resume uploading',
    },

    wrongFileChoosen: {
      title: 'Ooops!',
      text: 'You might have selected a wrong file. Filenames do not match',
      btnCancel: 'Cancel',
      btnOk: 'Replace file',
    },

    cantCreateCollections: {
      title: 'Sorry',
      text:
        '<p>For some reason, Pics.io failed to create the following collection(s):</p><ul>{$list}</ul>',
      btnCancel: 'Skip',
      btnOk: 'Retry',
    },

    cantHandleDroppedFiles: {
      title: 'Sorry',
      text:
        '<p>For some reason, Pics.io failed to process your files.</p><p>Please try to upload them again. If it doesn’t help, please turn to <a class="picsioLink" href="mailto:support@pics.io">support@pics.io<a> for assistance.</p>',
      btnCancel: 'Ok',
    },

    // textUploadFilesTo: 'Upload {countFiles} assets to',
    textKeywords: 'Keywords',
    textUpload: 'Upload',
    textNeedRequiredFields: 'Fill in the fields highlighted with red to upload',
    textBrowse: 'Browse files to add',
    textClear: 'Clear all',
    textCancel: 'Cancel',
    textSelectMedia: 'Select your media or drop files here',

    textFilesUploaded: ({ value1, value2, value3 }) => (
      <div>
        {value1} {pluralize('asset', value1)}, {value2} have been uploaded to{' '}
        <span className="highlight">{value3}</span>
      </div>
    ),
    textCantUploadFiles: "Can't upload assets. Contact support@pics.io.",
    textYouCannotUpload: (rootCollection) => `You can't upload assets into ${rootCollection}`,
    textFieldIsRequired: "This field was set as required by your team's admin, please fill it",

    flagAndRating: 'Flag and rating',
    flagAndColor: 'Flag and color',
    colorAndRating: 'Color and rating',
    flagOnly: 'Flag',
    colorOnly: 'Color',
    ratingOnly: 'Rating',

    titleNotification: 'Notification',
    textPreviewMode: 'Preview mode works only for less than 50 assets.',

    titleTheUserExceededQuota: 'The user has exceeded their Drive storage quota',
    textNoFreeSpaceGD:
      'It seems that you have no free space in your cloud storage. Consider freeing up some space or <a target = "_blank" href = "https://www.google.com/settings/storage">purchasing</a> additional storage from your Cloud Storage.',
    titleSelectCollection: 'Select a collection',
    textItBetterToUpload: (rootCollection) => `You’re uploading assets into ${rootCollection}. It’s always better to stay organized and put the assets into sub-collections. Do you want to continue?`,
    textContinue: 'Continue',

    textErrorRevisionUploadType: (extension) => `You've tried to upload the revision with a type different from original. The new revision should be a ${extension} type`,
    placeholderInputComment: 'Add a comment',
    helpLink: 'Details on How to upload new files',
    uploadPanelOfferText: 'Click to request import from GDrive, Dropbox, FTP',
  },

  TOOLBARS: {
    titleClosePreview: 'Close preview [Esc]',
    titleClose: 'Close [Esc]',
    titleDetails: 'Details',
    titleActivity: 'Activity',
    titleLiveSupport: 'Live support',
    titleSettings: 'Settings',
    titleView: 'View mode',
    titleSorting: 'Sort mode',
    titleHelpCenter: 'Help center',
    titleAnalytics: 'Analytics',

    titleUpload: 'Upload',
    titleCollections: 'Collections',
    titleKeywords: 'Keywords',
    titleSearches: 'Searches',
    titleLightboards: 'Lightboards',
    titleInbox: 'Inboxes',
    titleDownloadAssets: 'Download assets',
    titleDownloadSelectedAssets: (count) => `Download selected ${pluralize('asset', count)}`,
    titleDownloadAssetsAsArchive: 'Download all assets as an archive',
    titleRemoveAssets: 'Move to trash',
    titleCompareAssets: 'Compare assets',
    titleDownloadDialog: 'Download list',
    titleArchive: 'Archive',
    titleShare: 'Share asset',

    titleAddRevision: 'Add revision',
    titleDownload: 'Download',
    titleRemove: 'Move to trash',
    titleRemoveForever: 'Delete forever',
    titleRotateCW: 'Rotate CW',
    titleRotateCCW: 'Rotate CCW',
    titleHorizontalFlip: 'Horizontal flip',
    titleVerticalFlip: 'Vertical flip',
    titleEdit: 'Edit',
    titleZoom: 'Zoom to 100%',
    titleFit: 'Fit to screen',
    titleHideMultipagePanel: 'Hide multipage panel',
    titleShowMultipagePanel: 'Show multipage panel',

    textMyAccount: 'My account',
    textSync: 'Sync',
    textBilling: 'Billing',
    textGoogleDrive: 'Google Drive',
    textStorage: 'Storage',
    textCustomFields: 'Custom Fields',
    textMyTeam: 'My team',
    textAuditTrail: 'Audit trail',
    textReferralProgram: 'Referral program',
    textTutorials: 'Help center',
    textWhatsNew: "What's new",
    textSwitchAccount: 'Switch account',
    textLogOut: 'Log out',
    textDetails: 'Details',
    textNewFirst: 'New first',
    textOldFirst: 'Old first',
    textAtoZ: 'A to Z',
    textZtoA: 'Z to A',
    textCustom: 'Custom',
    textGrid: 'Grid',
    textList: 'List',
    textListSize: {
      textListx1: 'x1',
      textListx1_5: 'x1.5',
      textListx2: 'x2',
    },
    textMap: 'Map',
    textDownloadAll: 'Download all',
    textIntegrations: 'Check all products that integrate with Pics.io',
    revisionsDropdown: {
      textAddNewRevision: 'Add new revision',
    },
    textLiveSupportSpeech: 'Click here to connect with our live support, when you have questions or issues to report.',
  },

  WEBSITES: {
    textYouCanUseImage300x300:
      'You can use the image 300x300px, best to use a monochrome PNG with a transparent background',
    textUploadLogo: 'Upload logo',
    textBestUseImage500x1000: 'It is best to use 500-1000px image',
    textUploadYourPhoto: 'Upload your photo',
    textImageWillBeUsed: 'The image will be used for login page',
    textUploadBackground: 'Upload background',
    textUploadFavicon: 'Upload favicon',
    titleContacts: 'Contacts',
    labelShowFacebook: 'Show facebook',
    labelShowTwitter: 'Show twitter',
    labelShowInstagram: 'Show instagram',
    labelShowPhone: 'Show phone',
    labelShowEmail: 'Show email',
    labelShowBlog: 'Show blog',
    titleFileSettings: 'File settings',
    labelShowFlaggedImages: 'Show only flagged assets on home page',
    labelShowFilename: 'Show filename',
    titleWebsitePages: 'Website pages',
    labelEnableAboutPage: 'Enable about page',
    labelEnableContactsPage: 'Enable contacts page',
    titleSearch: 'Search',
    labelAllowSearchAssets: 'Allow to search for assets',
    labelAllowSearchTags: 'Show collections tree',
    titleDownloads: 'Downloads',
    labelAllowDownloadArchive: 'Allow to download archive with all assets',
    labelAllowDownloadFile: 'Allow to download one asset',
    labelAllowDownloadFiles: 'Allow to download assets',
    titleHistory: 'History',
    labelRevisions: 'Revisions',
    labelRevisionsDisabled: 'Revisions are disabled',
    labelComments: 'Comments',
    labelCommentsDisabled: 'Comments are disabled',
    titleInfopanel: 'Infopanel options',
    labelTitle: 'Title',
    labelDescription: 'Description',
    labelKeywords: 'Keywords',
    labelCustomFields: 'Custom fields',
    titleThumbnail: 'Thumbnail options',
    labelFilename: 'Filename',
    labelFlag: 'Flag',
    labelRating: 'Rating',
    labelColor: 'Color',
    titleCollections: 'Collections',
    titleCustomization: 'Customization',
    titleHomeScreen: 'Home screen layout',
    titleExpires: 'Expires at',
    titleSort: 'Assets sort order',
    titleCollectionSort: 'Collections sort',
    homeScreenCollection: 'Select collection for the home screen layout',

    titleSocialButtons: 'Social buttons',
    textDontShow: "Don't show",
    textLeft: 'Left',
    textRight: 'Right',

    textChange: 'Change',
    textShow: 'Show',

    textHttpsNotValid: 'https is not valid, please use http',
    textUrlNotValid: 'URL is not valid',
    textWordsCantBeUsed: (words) => `Words "${words}" can\'t be used at the url begging`,
    textTopLevelFolders: 'URL should contain only top-level folders',
    textUrlInUse: 'URL is already in use',
    textGoogleAnalIsntValid: 'This Google analytics identifier is not valid',
    textMain: 'Main',
    textSecurity: 'Security',
    textPassword: 'Password',
    textNotifications: 'Notifications',
    textCustomization: 'Customization',
    textSEO: 'SEO',
    textAnalytics: 'Analytics',

    textCreateWebsite: 'Website settings',
    textUpdateWebsite: 'Website settings',
    textCreate: 'Publish',
    textDelete: 'Unpublish',
    textLoading: 'Loading',

    titleError: 'Error',
    textWebsiteWasntFound: "Website wasn't found",

    titleErrors: 'Errors',

    titleAttention: 'Attention!',

    textNorecord:
      "The domain name you specified couldn't be resolved. That might be because of a typo. Please, check the domain name carefully. If you just bought the domain, probably, DNS changes still haven't been propagated, it takes up to 48 hours. Press OK to proceed anyway.",
    textAnotherip:
      "Domain name you specified points to the different ip address. Should be: 54.243.40.217. That might be because of a typo. Please, check the domain name carefully. If the name is correct and you just changed DNS records, probably, DNS changes still haven't been propagated, it takes up to 48 hours. Press OK to proceed anyway.",

    textDomainCantVerified: "Domain can't be verified",

    titleWarning: 'Warning',
    textSavingAsseets: 'Saving assets...',
    textSavingWebsite: 'Preparing website...',

    alertWebsiteCreated:
      'Website <span class="highlight">published</span>, assets are preparing now. We will send you an email when the process will be finished.',
    textVisitWebsite: 'Visit website',
    textWebsiteCreationUnsuccessful: 'Website publishing was unsuccessful. Please, try again.',
    textWebsiteUpdatingUnsuccessful: 'Website publishing was unsuccessful. Please, try again.',
    textWebsiteSomeImagesUnsuccessful:
      'Some images for website settings not uploaded. Please, try again.',
    alertErrorHappened:
      'Error happened in the process of the website removing. Contact us at <a class="picsioLink" href="mailto:support@pics.io">support@pics.io<a>',

    titleWarningChangePlan: 'Websites functionality is restricted',
    descriptionWarningChangePlan: (onClickHandler) => (
      <div>
        Websites functionality is not available for your current plan. Please upgrade your{' '}
        <span className="picsioLink" onClick={onClickHandler}>
          subscription
        </span>{' '}
        to use this feature.
      </div>
    ),

    textContact: 'Contact',
    textSiteWillBeDeleted: 'Website will be unpublished. Are you sure?',
    textPasswordConfirm: 'Password and confirm password are not equal',
    titleMainOptions: 'Main options',
    labelYourSiteLink: 'Your new website link',
    labelSelectTemplate: 'Select your template',
    labelTypePassword: 'Type password',
    labelConfirmPassword: 'Confirm password',
    titleSeo: 'SEO',
    labelGoogleAnalIdentifier: 'Google Analytics identifier',
    labelCustomGalleryTitle: 'Custom gallery title',
    placeholderTitle: 'Title',
    titleRobots: 'Search robots indexing',
    labelNoIndex: 'No index',
    labelNoFollow: 'No follow',

    titleNotificationsEmail: 'Email for notifications',
    placeholderEnterEmail: 'Enter email',
    labelSelectEmail: 'Email',
  },

  COLLECTIONS: {
    titleAddKeyword: 'Add keyword',
    textApply: 'Apply',
    textPlaceholderName: 'Name',
    textCantRemoveKeyword:
      'Can\'t remove keyword. Please try again. Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
    textCantUpdateKeyword:
      'Can\'t update keyword(s). Please try again. Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
    titleRenameKeyword: 'Rename keyword',
    textYouAreGoingToRenameKeyword: 'You are going to rename keyword. Continue?',
    textPlaceholderNewName: 'New name',
    textAddedTo: 'added to',
    textRemovedFrom: 'removed from',
    // textHasBeenFavorites: 'has been {actionValue} Favorites',
    titleFavorites: 'Favorites',
    titleKeywords: 'Keywords',
    textCantGetKeywords:
      'Can\'t get keywords. Please try again. Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',

    errorTeammatesWasntAdded: 'Your teammates were not added. Looks like they are already added.',
    errorTeammateWasntAdded:
      "Teammate wasn't added. Looks like he is already present in others teams.",
    errorUnableToAddTeammates: 'Unable to add teammates. Please try again.',
    textSearching: 'Searching...',
    textProcessingFiles: 'Processing assets...',

    textFilesAddedToCollection: (count, collectionName) => `${count} ${pluralize('asset', count)} have been added to collection "${collectionName}"`,
    textFilesNotAddedToCollection: (count, collectionName) => `${count} ${pluralize(
      'asset',
      count,
    )} haven't been added to collection "${collectionName}". Please contact support@pics.io`,
    textFilesAddedToLightboard: (lightboardName) => `Assets have been added to lightboard "${lightboardName}"`,
    textFilesNotAddedToLightboard: (lightboardName) => `Assets haven\'t been added to lightboard "${lightboardName}". Please contact support@pics.io`,
    textLightboardFolderNotFound:
      'Your lightboards folder is not found in your cloud storage. Please contact <a href="mailto:support@pics.io?subject=Lightboards folder is not found in Google Drive">support@pics.io</a>',
  },

  LIGHTBOARDS: {
    title: 'Lightboards',
    buttonAddLightboard: 'Create lightboard',
    titleAddLightboard: 'Add new lightboard',
    textDeleteLightboard: 'Delete lightboard',
    textDeleteName: (name) => `Delete "${name}"?`,
    // textRenameName: name => `Rename "${name}"?`,
    textEnterNewName: 'Enter new name',
  },

  CATALOG_VIEW: {
    textError: 'Error',
    cantLoadData:
      "Can't load data. Please try again. Contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats",
    collectionNotFound: 'Collection not found',
    errorCheckSearchQueryTitle: 'Incorrect search query',
    errorCheckSearchQuery:
      "Please check your search query for mistakes.<br>Use our <a href='https://help.pics.io/search-engine' target='_blank'>Help Center</a> for reference.",
    notifications: {
      collectionUpdated: 'This collection has been updated. Refresh to see changes.',
      inboxUpdated: 'This inbox has been updated. Refresh to see changes.',
      searchByLocationEnabled:
        'Only assets with geolocation are displayed. To see all assets please press the refresh button.',
    },
  },

  PREVIEW_VIEW: {
    errorLoadFile: "Can't load asset",
    noPreview: 'no preview available',
    textDropFile: 'Drop file to add a new revision',
    movedToTrash: 'moved to trash',
    restore: 'restore',
    errorFilesCount: 'To add a new revision drop one file',
    editingNotSupportedInSafari:
      'Pics.io editor is temporarily unavailable in Safari. Please use another browser (e.g. Google Chrome or Firefox) to edit assets.',
    editingNotSupported: 'Sorry. This file format is not supported in Pics.io editor yet',
    fileNotFound: 'File not found',
  },

  INPUT_DATE_RANGE: {
    any: 'Any time',
    today: 'Today',
    yesterday: 'Yesterday',
    lastweek: 'Last 7 days',
    lastmonth: 'Last 30 days',
    last90days: 'Last 90 days',
    custom: 'Customized...',
  },

  ASSING_USER: {
    title: 'Assign users',
    placeholder: 'You have not invited',
    filterText: 'Assign users',
  },

  DROPDOWN: {
    create: 'Create',
    createKeyword: 'Create keyword',
    chooseKeywords: 'Attach keywords',
    chooseCustomFields: 'Choose custom fields',
    placeholderKeywords: 'You have no keywords yet',
    placeholderKeywordsCreate: 'Start typing to create a keyword',
    noResults: 'No results found for',
  },

  SERVER_ERROR: {
    title: 'Something went wrong.',
    text: 'Please reload pics.io. Contact support@pics.io if error repeats.',
  },

  INPUT_FILE: {
    placeholder: 'No file is chosen',
    btnText: 'Choose',
  },

  SORT: {
    alphabetical: 'Alphabetical',
    uploadTime: 'Upload time',
    updateTime: 'Update time',
    createTime: 'Create time',
    rating: 'Rating',
    color: 'Color',
    fileSize: 'File size',
    pageNumber: 'Page number',
    fileType: 'File type',
    creator: 'Creator',
    copyright: 'Copyright',
    custom: 'Custom',
    imageResolution: 'Image resolution',
    assetNumber: 'Assets number',
  },

  SCREEN_ASSET_SHARING: {
    title: 'Asset sharing settings',
    textMain: 'Main',
    textSecurity: 'Security',

    textChange: 'Change',
    textShow: 'Show',
    share: 'share',
    unshare: 'stop sharing',

    titleLink: 'Link',
    titlePassword: 'Password',
    placeholderEnterPassword: 'Enter Password',
    placeholderEnterPasswordRetype: 'Retype Password',

    titleDownloads: 'Downloads',
    labelAllowDownloadFile: 'Allow to download one asset',
    titleHistory: 'History',
    labelRevisions: 'Revisions',
    labelRevisionsDisabled: 'Revisions are disabled',
    labelComments: 'Comments',
    labelCommentsDisabled: 'Comments are disabled',
    titleInfopanel: 'Infopanel options',
    labelTitle: 'Title',
    labelDescription: 'Description',
    labelKeywords: 'Keywords',
    labelCustomFields: 'Custom fields',
    titleMarks: 'Asset marks',
    labelFlag: 'Flag',
    labelRating: 'Rating',
    labelColor: 'Color',
  },

  RECURSIVE_SEARCH: {
    labelOnTreeDontShow: "Don't show assets in nested collections",
    labelOnCatalogPanelDontShow:
      'Assets from nested collections are NOT included in the search results. Switch the toggle to include them into the search.',
    labelOnCatalogPanelShow:
      'Assets from nested collections are included in the the search results. Switch the toggle to exclude them from the search.',
  },

  SHORTCUTS: {
    title: 'Shortcuts',
  },

  SETTINGS: {
    errorTitle: 'Error save settings',
    errorText:
      'Can\'t update settings. Please try again. Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
  },

  CATALOG_ITEM: {
    tooltipDelete: 'Move to trash',
    tooltipEdit: 'Edit',
    tooltipDownload: 'Download',
    tooltipAddRevision: 'Add revision',
    tooltipAddComment: 'Add comment',
    tooltipEditCollections: 'Edit collections',
    tooltipShareAsset: 'Share asset',
    tooltipShareAssetSettings: 'Sharing settings',
    tooltipRestore: 'Restore',
    tooltipDeleteForever: 'Delete forever',
    tooltipRemoveFromLightboard: 'Remove from lightboard',
    tooltipGoToComments: 'Go to comments',
    tooltipGoToRevisions: 'Go to revisions',
    busyStatus: {
      isGoingToTrash: 'Deleting an asset',
      isGoingToDelete: 'Permanently deleting an asset',
      isGoingToRestore: 'Restoring an asset',
      isGoingToMove: 'Moving an asset',
    },
    tooltipDuplicate: 'Duplicate',
  },

  ACTIONS_TOOLBAR: {
    ASSETS: {
      share: 'Share asset',
      download: 'Download',
      addRevision: 'Add revision',
      attachCollection: 'Attach collection',
      attachToCollection: 'Attach to collection',
      delete: 'Move to trash',
      restore: 'Restore',
      deleteForever: 'Delete forever',
      archive: 'Archive',
      unarchive: 'Unarchive',
      compare: 'Compare',
      compare1asset: 'Select a second asset to enable comparison tool',
      compare3asset: 'Select only two assets to enable comparison tool',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
    },
    COLLECTIONS: {
      upload: 'Upload assets',
      createWebsite: 'Publish to web',
      websiteSettings: 'Website settings',
      move: 'Move collection',
      download: 'Download collection',
      archive: 'Archive collection',
      unarchive: 'Unarchive collection',
      delete: 'Delete collection',
    },
    KEYWORDS: {
      delete: (count) => `Delete selected ${pluralize('keyword', count)}`,
      merge: (count) => `Merge selected ${pluralize('keyword', count)}`,
    },
  },

  HELP_CENTER: {
    previewView: {
      url: 'general-info/help-center-index',
      tooltip: 'Learn more about Pics.io features',
    },
    catalogView: {
      url: 'general-info/help-center-index',
      tooltip: 'Learn more about Pics.io features',
    },
    auditTrail_audit: {
      url: 'teamwork-in-pics-io/settings-audit-trail',
      tooltip: 'Learn more about Audit Trail log',
    },
    auditTrail_analytics: {
      url: 'en/articles/4097770-analytics',
      tooltip: 'Explore how to work with Pics.io analytics&reporting',
    },
    customFieldsSchema: {
      url: 'working-with-metadata/settings-custom-fields',
      tooltip: 'Learn how to configure custom fields',
    },
    myAccount_account: {
      url: 'pics-io-settings/edit-user-account-information',
      tooltip: 'Learn how to edit your account info',
    },
    myAccount_settings: {
      url: 'pics-io-settings/edit-user-account-information',
      tooltip: 'Learn how to edit your account info',
    },
    myAccount_notifications: {
      url: 'pics-io-settings/edit-user-account-information',
      tooltip: 'Learn how to edit your account info',
    },
    myAccount_security: {
      url: 'en/articles/5406508-two-factor-authentication-2fa',
      tooltip: 'Learn how to edit your account info',
    },
    myAccount_legal: {
      url: 'en/articles/4514944-login-consent-for-support-team',
      tooltip: 'Learn more about Personal Data Protection in Pics.io',
    },
    myBilling_overview: {
      url: 'pics-io-settings/billing',
      tooltip: 'Learn how to set up billing in Pics.io',
    },
    myBilling_info: {
      url: 'pics-io-settings/billing',
      tooltip: 'Learn how to set up billing in Pics.io',
    },
    myBilling_invoices: {
      url: 'pics-io-settings/billing',
      tooltip: 'Learn how to set up billing in Pics.io',
    },
    myBilling_card: {
      url: 'pics-io-settings/billing',
      tooltip: 'Learn how to set up billing in Pics.io',
    },
    myTeam_teammates: {
      url: 'teamwork-in-pics-io/inviting-new-teammates',
      tooltip: 'Learn how to invite new teammates',
    },
    myTeam_roles: {
      url: 'teamwork-in-pics-io/assigning-roles-to-teammates',
      tooltip: 'Learn how to assign roles to teammates',
    },
    myTeam_integrations: {
      url: 'integrations',
      tooltip: 'Learn more about Pics.io integrations',
    },
    myTeam_settings: {
      url: 'teamwork-in-pics-io/team-policies',
      tooltip: 'Learn how to set up team policies',
    },
    myTeam_analytics: {
      url: 'en/articles/4097770-analytics',
      tooltip: 'Explore how to work with Pics.io analytics&reporting',
    },
    myTeam_branding: {
      url: 'en/articles/3738906-branding-for-teams',
      tooltip: 'Learn how to set up team branding',
    },
    myTeam_profile: {
      url: 'teamwork-in-pics-io/team-policies',
      tooltip: 'Learn how to set up team profile',
    },
    myTeam_security: {
      url: 'en/articles/5406508-two-factor-authentication-2fa',
      tooltip: 'Learn how to set up 2FA',
    },
    myTeam_watermarking: {
      url: '',
      tooltip: 'Learn more about watermarks',
    },
    myTeam_aiKeywords: {
      url: '',
      tooltip: '',
    },
    storage: {
      url: 'integration-with-google-drive/integration-with-team-drive',
      tooltip: 'Learn more about Pics.io integration with Team Drive',
    },
    syncDialog: {
      url: 'integration-with-google-drive/synchronizing-google-drive-with-picsio',
      tooltip: 'Learn more about how cloud storage syncs with Pics.io',
    },
    sync: {
      url: 'integration-with-google-drive/synchronizing-google-drive-with-picsio',
      tooltip: 'Learn more about how cloud storage syncs with Pics.io',
    },
    uploadPanel: {
      url: 'working-with-assets/uploading-new-files',
      tooltip: 'Learn how to upload new files to Pics.io',
    },
    websites: {
      url: 'sharing-assets-to-non-pics-io-members-websites/sharing-assets-outside-picsio',
      tooltip: 'Learn how to share assets outside Pics.io',
    },
    singleAssetSharing: {
      url: 'sharing-assets-to-non-pics-io-members-websites/single-asset-sharing',
      tooltip: 'Learn how to share individual assets outside Pics.io',
    },
    webhooks: {
      url: 'integrations/webhooks',
    },
    zapier: {
      url: 'integrations/zapier',
    },
    referralProgram: {
      url: 'en/articles/4097656-pics-io-referral-program',
      tooltip: 'Learn how to use a referral program',
    },
    inboxes: {
      url: 'en/articles/4066282-inbox',
      tooltip: 'Learn how non-Pics.io users can upload files to your library',
    },
  },

  ANALYTICS: {
    axisXDays: 'days',
    titleSummOfVisitors: 'Number of visitors',
    axisYSummOfVisitors: 'Visitors',
    titleWebsiteDownloadedByWEbUsers: 'Assets downloads',
    AxisYWebsiteDownloadedByWEbUsers: 'Asset downloads',
    titleTeammates: 'Number of teammates',
    axisYTeammates: 'Teammates',
    titleUserLoginStats: 'Number of teammates logged in',
    axisYTitleUserLoginStats: 'Logged in',
    titleAssetDownloadedByTeam: 'Asset downloaded by team',
    axisYAssetDownloadedByTeam: 'Asset downloaded',
    titleAssetDownloadedByWebUsers: 'Asset downloaded by web users',
    axisYAssetDownloadedByWebUsers: 'Asset downloaded',
    titleAssetChanged: 'Number of asset revisions',
    titleMetadataChangedData: 'Total asset metadata changes',
    titleAssetsUploaded: 'assets in the library',
    axisYAssetsUploaded: 'Assets',
    titleAssetsDownloadedByTeam: 'Assets downloads',
    axisYAssetsDownloadedByTeam: 'Assets downloads',
    titleWebsitesDownloadedByWebUsersData: 'Assets downloads from websites',
    axisYwebsitesDownloadedByWebUsersData: 'Asset downloads',
    titleRatingTableGraph: 'Top assets downloads',
    axisYRatingTableGraph: '',
    titleMetadataChanged: 'Total metadata changes on all assets',
    axisYMetadataChanged: 'Metadata changed',
    titleAssetsCommented: 'Assets commented',
    axisYAssetsCommented: 'Assets commented',
    titleActiveWebSites: 'active websites',
    axisYActiveWebSites: 'active websites',
    titleAssetsInTheLibrary: ' assets in the library',
    placeholder: {
      fetching: 'Processing...',
      noAvailable: 'You have no data yet',
      noSupported: 'This data is not available on your plan',
    },
  },

  NOTIFICATION_SETTINGS: {
    titleNotificationsByCollection: (collectionName) => (
      <>
        Settings for <span className="pageItemTitleColor">"{collectionName}"</span> collection
      </>
    ),
    enableAll: 'Send all event types',
    disableAll: 'Do not send anything',
    sendSelected: 'Select event types to send',
    loading: 'Event type list is loading...',
    errorGetSettingsTypes:
      'Can\'t load data. Please try again.<br> Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
    errorSavingSettings:
      'Can\'t save settings. Please try again.<br> Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',
    errorGetSettingsCollections:
      'Can\'t load collections data. Please try again.<br> Contact <a class="picsioLink" href="mailto:support@pics.io">pics.io</a> support if the error repeats.',

    emailNotifications: {
      title: 'Global email notifications',
      collectionTitle: (collectionName) => (
        <>
          <span className="pageItemTitleColor">"{collectionName}"</span> email notifications
        </>
      ),
    },

    slackNotifications: {
      title: 'Slack Notificatios',
    },

    socketNotifications: {
      title: 'Global browser push notifications',
      collectionTitle: (collectionName) => (
        <>
          <span className="pageItemTitleColor">"{collectionName}"</span> browser push notifications
        </>
      ),
      descriptionNotSupportedNotificationsApi: 'Your browser does not support Notifications API.',
      descriptionPushNotificationsEnabled: 'Push notifications are allowed for Pics.io.',
      descriptionPushNotificationsBlocked: 'Push notifications are blocked for Pics.io.',
      descriptionPushNotification1: 'Push notifications are disabled for Pics.io. ',
      descriptionPushNotification2: ' to enable.',
      textClickButton: 'Click',
      howToEnableOrDisablePushNotifications:
        'How to enable or disable Push Notifications on browsers',
    },

    notificationCenter: {
      title: 'Global notification center',
      collectionTitle: (collectionName) => (
        <>
          <span className="pageItemTitleColor">"{collectionName}"</span> notification center
        </>
      ),
    },

    allowMentions: 'Allow notifications about mentions in any case',
  },

  VIDEO: {
    playVideo: 'Play video',
    pauseVideo: 'Pause video',
    muteSound: 'Mute sound',
    unmuteSound: 'Unmute sound',
    takeSnapshot: 'Take a snapshot',
    createThumbnail: 'Create custom thumbnail',
    cropVideo: 'Crop video',
    cropVideoTooltip: 'Download',
    enterFullscreenMode: 'Enter fullscreen mode',
    errorCreatingThumbnail:
      "Can't create custom thumbnail.<br> Please try again later or contact support@pics.io.",
    errorCreatingScreenshot:
      "Can't create screenshot.<br> Please try again later or contact support@pics.io.",
    errorProxyResponding:
      'Server is not responding.<br> Please try again later or contact support@pics.io.',
    warningThumbnailGeneratingTitle: 'Please wait',
    warningThumbnailGenerating:
      'Your custom thumbnail is on the way. It may take a couple of minutes.',
    spinnerCreatingThumbnail: 'Creating video thumbnail',
    spinnerCreatingScreenshot: 'Creating video screenshot',
    safariErrorTitle: 'Feature is not available',
    safariErrorTxt:
      'This feature is not available in Safari.<br> Please try to use Google Chrome or Firefox.',
    iosErrorTxt: 'This feature is not available on iOS devices.',
  },

  PROCESSING: {
    title: 'The number of assets under processing:',
    keywording: 'Generating keywords',
    replicating: 'Saving XMP/EXIF metadata to your cloud storage',
    metadating: 'Reading XMP/IPTC metadata',
    contenting: 'Preparing content for text search (PDF & AI)',
    thumbnailing: 'Generating thumbnails',
    trashing: 'Moving to trash',
    untrashing: 'Restoring',
    deleting: 'Deleting forever',
    moving: 'Moving',
    transcoding: 'Converting videos',
    syncing: 'Sync is running',
    failed: {
      keywording:
        'Keyword generation ran into a problem. Please shoot an email to <a class="picsioLink" href="mailto:support@pics.io">support@pics.io</a> if you want to have this issue resolved.',
      replicating:
        'Saving XMP/EXIF metadata to your cloud storage ran into a problem. Please shoot an email to <a class="picsioLink" href="mailto:support@pics.io">support@pics.io</a> if you want to have this issue resolved.',
      metadating:
        'Reading XMP/IPTC metadata ran into a problem. Please shoot an email to <a class="picsioLink" href="mailto:support@pics.io">support@pics.io</a> if you want to have this issue resolved.',
      contenting:
        'Preparing content for text search ran into a problem. Please shoot an email to <a class="picsioLink" href="mailto:support@pics.io">support@pics.io</a> if you want to have this issue resolved.',
    },
    rerun: {
      metadating: 'Re-run metadata parsing',
      replicating: 'Re-run metadata saving',
      thumbnailing: 'Re-run generating thumbnail',
    },
  },

  MAPVIEW: {
    placeholderNoAssets: 'There are no assets with Geo data in this collection',
    spinnerLoadingAssets: 'Loading assets...',
  },

  TEAMMATES_DIALOG: {
    title: 'My team',
    btnOk: 'Ok',
    // btnOk: 'Leave',
    // btnCancel: 'Continue',
  },

  GLOBAL: {
    tooltipMinimize: 'Minimize',
  },

  UPGRADE_PLAN: {
    text: 'Upgrade plan',
    textForHigherPlan: 'For higher plan',
    tooltipBasic: 'Upgrade plan to use this feature.',
    tooltip: 'Upgrade to use this feature. Click to learn more.',
    tooltipPlanLimitations: 'Please note that this functionality is available on higher plan',
    tooltipForButtons: 'Upgrade to higher plan',
  },

  DONE: 'Done',

  CONSENT: {
    title: 'Consent',
    WEBSITE: {
      VISITING: {
        labelStatus: 'Show consent when visiting',
        labelTitle: 'Title for consent when visiting',
        labelMessage: 'Message for consent when visiting',
        defaultTitle: 'Copyright consent',
        defaultMessage:
          "The contents of this website, including (but not limited to) all written materials, images, photos, videos are protected under international copyright and trademarks laws. Please confirm that you will not copy, reproduce, modify, republish, transmit or distribute any material from this site without the owner's permission.",
      },
      ACTION: {
        labelStatus: 'Show consent when downloading',
        labelTitle: 'Title for consent when downloading',
        labelMessage: 'Message for consent while downloading',
        defaultTitle: 'Copyright consent',
        defaultMessage:
          "Please note that you are not allowed you to copy, reproduce, modify, republish, transmit or distribute any material from this site without the owner's permission.",
      },
    },

    SAS: {
      VISITING: {
        labelStatus: 'Show consent when visiting',
        labelTitle: 'Title for consent when visiting',
        labelMessage: 'Message for consent when visiting',
        defaultTitle: 'Copyright consent',
        defaultMessage:
          "The contents of this website, including (but not limited to) all written materials, images, photos, videos are protected under international copyright and trademarks laws. Please confirm that you will not copy, reproduce, modify, republish, transmit or distribute any material from this site without the owner's permission.",
      },
      ACTION: {
        labelStatus: 'Show consent when downloading',
        labelTitle: 'Title for consent when downloading',
        labelMessage: 'Message for consent while downloading',
        defaultTitle: 'Copyright consent',
        defaultMessage:
          "Please note that you are not allowed you to copy, reproduce, modify, republish, transmit or distribute any material from this site without the owner's permission.",
      },
    },

    INBOX: {
      VISITING: {
        labelStatus: 'Show consent when visiting',
        labelTitle: 'Title for consent when visiting',
        labelMessage: 'Message for consent when visiting',
        defaultTitle: 'Copyright consent',
        defaultMessage:
          'Please note that materials from this website are accessible to third parties. Accept the consent if you still need to upload your files.',
      },
      ACTION: {
        labelStatus: 'Show consent when uploading',
        labelTitle: 'Title for consent when uploading',
        labelMessage: 'Message for consent while uploading',
        defaultTitle: 'Copyright consent',
        defaultMessage:
          'Please note that you are going to upload the assets that will be accessible to third parties. Accept the consent if you still need to upload your files.',
      },
    },
  },

  MODIFIED_FIELD: {
    tooltip: (userName) => `This field was edited by ${userName}. Pics.io will not overwrite this field even in case metadata is found in the original file. Please click this mark to allow overwriting.`,
    currentUser: 'you',
    teammate: 'your teammate',
  },

  SUPPORT: {
    ACCESS_TO_YOUR_ACCOUNT: 'Access to your account',
    CONSENT:
      'You grant Pics.io team access to your account for the next 24 hours to use your information in accordance to their terms of service.',
  },

  MOBILE_APP: {
    IS_NOT_AVAILABLE:
      'Note: This functionality is not available in mobile app. Please use the desktop version to access it.',
  },

  WARNING: 'Warning',
  ERROR: 'Error',
  SOMETHING_WENT_WRONG: {
    TITLE: 'Oops! Something went wrong',
    TEXT:
      "Please try again and contact <a class='picsioLink' href='mailto:support@pics.io'>pics.io</a> support if the error repeats.",
  },

  EMPTY_SEARCH: {
    SAVED_SEARCHES: {
      assigned: (displayName) => `This saved search shows all assets that were assigned to a user ${displayName}`,
      restricted: 'This saved search shows all assets that were restricted for download or any other action by somebody on your team',
      uncategorized: 'This saved search shows all assets that are not attached to any collection',
      corrupted: 'This saved search shows all files that cannot be previewed within Pics.io because there are damaged or corrupted in some way',
      spreadsheets: 'This saved search shows all assets that have .xlsx extension',
      jpg: 'This saved search shows all assets that have .jpg or .jpeg extension',
      text: () => <>This saved search shows all assets that are .rtf, .docs, or .txt.<br /> If there are any such assets in the future, they will show up here</>,
      pdf: 'This saved search shows all assets that have PDF extension',
      ai: 'This saved search shows all assets that were generated with Adobe Illustrator',
      photoshop: 'This saved search shows all assets that that were generated with Adobe Photoshop',
      gps: 'This saved search shows all assets that have GPS coordinates in their metadata',
      gpsno: 'This saved search shows all assets that don\'t have GPS coordinates in their metadata',
      video: 'This saved search shows all assets that have any of video extension types (like mp4, mpv, mov etc)',
      createdToday: 'This saved search shows all assets that were created within current date',
      createdWeek: 'This saved search shows all assets that were uploaded during current calendar week',
      createdMonth: 'This saved search shows all assets that were uploaded during current calendar month',
      dublicates: 'This saved search shows all assets that are identical copies of each other',
      raw: 'This saved search shows all assets that have a RAW extension',
      shared: 'This saved search shows all assets that were shared publicly to the web',
      watermarked: 'This saved search shows all assets that have a watermark applied on them.',
    },
  },
};
