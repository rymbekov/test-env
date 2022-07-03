import localization from '../../../shared/strings';

export const checkboxes = {
  contacts: {
    id: 'contacts',
    title: localization.WEBSITES.titleContacts,
    items: [
      {
        label: localization.WEBSITES.labelShowFacebook,
        show: 'fbLinkShow',
      },
      {
        label: localization.WEBSITES.labelShowTwitter,
        show: 'twitterLinkShow',
      },
      {
        label: localization.WEBSITES.labelShowInstagram,
        show: 'instagramLinkShow',
      },
      {
        label: localization.WEBSITES.labelShowPhone,
        show: 'phoneShow',
      },
      {
        label: localization.WEBSITES.labelShowEmail,
        show: 'emailShow',
      },
      {
        label: localization.WEBSITES.labelShowBlog,
        show: 'blogLinkShow',
      },
    ],
  },
};

const customizationConfig = {
	imagePickers: [
		{
			id: 'logoUrl',
			icon: 'circle',
			title: 'Logo',
			description: localization.WEBSITES.textYouCanUseImage300x300,
			btnTitle: localization.WEBSITES.textUploadLogo,
			IMAGE_SIZE_LIMIT: 1024 * 1024 /** 1mb */,
		},
		{
			id: 'avatarUrl',
			icon: 'avatar',
			title: 'Photo',
			description: localization.WEBSITES.textYouCanUseImage300x300,
			btnTitle: localization.WEBSITES.textUploadYourPhoto,
			IMAGE_SIZE_LIMIT: 1024 * 1024 /** 1mb */,
		},
		{
			id: 'backgroundLoginPageUrl',
			icon: 'emptyBackgroundLoginPage',
			title: 'Background',
			description: localization.WEBSITES.textImageWillBeUsed,
			btnTitle: localization.WEBSITES.textUploadBackground,
			IMAGE_SIZE_LIMIT: 5 * 1024 * 1024 /** 5mb */,
		},
	],
	checkboxes: [
		checkboxes.contacts,
		{
			id: 'file_settings',
			title: localization.WEBSITES.titleFileSettings,
			items: [
				{
					label: localization.WEBSITES.labelShowFlaggedImages,
					show: 'showFlagged',
				},
				{
					label: localization.WEBSITES.labelShowFilename,
					show: 'websiteFileNameShow',
				},
			],
		},
		{
			id: 'website_pages',
			title: localization.WEBSITES.titleWebsitePages,
			items: [
				{
					label: localization.WEBSITES.labelEnableAboutPage,
					show: 'aboutShow',
				},
				{
					label: localization.WEBSITES.labelEnableContactsPage,
					show: 'contactsShow',
				},
			],
		},
		{
			id: 'downloads',
			title: localization.WEBSITES.titleDownloads,
			items: [
				{
					label: localization.WEBSITES.labelAllowDownloadArchive,
					show: 'downloadLinkShow',
				},
				{
					label: localization.WEBSITES.labelAllowDownloadFile,
					show: 'downloadSingleFile',
				},
			],
		},
	],
};

export default customizationConfig;
