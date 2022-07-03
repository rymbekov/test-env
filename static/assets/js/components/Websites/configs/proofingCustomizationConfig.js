import localization from '../../../shared/strings';

import { checkboxes } from './customizationConfig';

const proofingCustomizationConfig = {
  imagePickers: [
    {
      id: 'logoUrl',
      title: 'Logo',
      icon: 'circle',
      description: localization.WEBSITES.textYouCanUseImage300x300,
      btnTitle: localization.WEBSITES.textUploadLogo,
      IMAGE_SIZE_LIMIT: 1 * 1024 * 1024 /** 1mb */,
    },
    {
      id: 'backgroundLoginPageUrl',
      title: 'Background',
      icon: 'emptyBackgroundLoginPage',
      description: localization.WEBSITES.textImageWillBeUsed,
      btnTitle: localization.WEBSITES.textUploadBackground,
      IMAGE_SIZE_LIMIT: 5 * 1024 * 1024 /** 5mb */,
    },
  ],
  checkboxes: [
    checkboxes.contacts,
    {
      id: 'searchShow',
      title: localization.WEBSITES.titleSearch,
      show: true,
      change: false,
      items: [
        {
          label: localization.WEBSITES.labelAllowSearchAssets,
          show: 'searchShow', // value is a key for DB prop
        },
      ],
    },
    {
      id: 'tagsTreeShow',
      title: localization.WEBSITES.titleCollections,
      show: true,
      change: false,
      items: [
        {
          label: localization.WEBSITES.labelAllowSearchTags,
          show: 'tagsTreeShow', // value is a key for DB prop
        },
      ],
    },
    {
      id: 'downloads',
      title: localization.WEBSITES.titleDownloads,
      show: true,
      change: false,
      items: [
        {
          label: localization.WEBSITES.labelAllowDownloadArchive,
          show: 'download', // value is a key for DB prop
        },
        {
          label: localization.WEBSITES.labelAllowDownloadFile,
          show: 'downloadSingleFile',
        },
      ],
    },

    {
      id: 'history',
      title: localization.WEBSITES.titleHistory,
      show: true,
      change: true,
      items: [
        {
          label: localization.WEBSITES.labelRevisions,
          labelDisabled: localization.WEBSITES.labelRevisionsDisabled,
          show: 'revisionsShow',
          dependentOn: 'revisions',
        },
        {
          label: localization.WEBSITES.labelComments,
          labelDisabled: localization.WEBSITES.labelCommentsDisabled,
          show: 'commentShow',
          change: 'comment',
          dependentOn: 'comments',
        },
      ],
    },
    {
      id: 'infopanel',
      title: localization.WEBSITES.titleInfopanel,
      show: true,
      change: true,
      items: [
        {
          label: localization.WEBSITES.labelTitle,
          show: 'titleShow',
          change: 'titleEditable',
        },
        {
          label: localization.WEBSITES.labelDescription,
          show: 'descriptionShow',
          change: 'descriptionEditable',
        },
        {
          label: localization.WEBSITES.labelCustomFields,
          show: 'customFieldsShow',
        },
      ],
    },
    {
      id: 'thumbnail',
      title: localization.WEBSITES.titleThumbnail,
      show: true,
      change: true,
      items: [
        {
          label: localization.WEBSITES.labelFilename,
          show: 'fileNameShow',
        },
        {
          label: localization.WEBSITES.labelFlag,
          show: 'flagShow',
          change: 'flag',
        },
        {
          label: localization.WEBSITES.labelRating,
          show: 'ratingShow',
          change: 'rating',
        },
        {
          label: localization.WEBSITES.labelColor,
          show: 'colorShow',
          change: 'color',
        },
      ],
    },
  ],
};

export default proofingCustomizationConfig;
