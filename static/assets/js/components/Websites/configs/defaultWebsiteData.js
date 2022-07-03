const defaultWebsiteData = {
  // MAIN
  template: 'default',

  // CUSTOMIZATION PROOFING
  download: false,
  revisionsShow: false,
  commentShow: false,
  comment: false,
  titleShow: false,
  titleEditable: false,
  descriptionShow: false,
  descriptionEditable: false,
  customFieldsShow: false,
  searchShow: false,
  fileNameShow: false,
  flagShow: false,
  flag: false,
  ratingShow: false,
  rating: false,
  colorShow: false,
  color: false,
  tagsTreeShow: false,

  // CUSTOMIZATION WEBSITES
  overridedDisplayName: '', // this field overrides default user.fullname
  overridedTagname: '', // this field overrides default user.fullname
  logoUrl: '',
  avatarUrl: '',
  backgroundLoginPageUrl: '',
  baseColor: null,
  fbLinkShow: true,
  twitterLinkShow: true,
  instagramLinkShow: true,
  phoneShow: true,
  emailShow: true,
  blogLinkShow: true,
  showFlagged: false,
  websiteFileNameShow: false,
  aboutShow: true,
  contactsShow: true,
  downloadLinkShow: true,
  downloadSingleFile: true,
  sharingButtonsShow: '',

  // SEO
  googleAnalyticsIdentifier: '',
  customGalleryTitle: '',
  noFollow: false,
  noIndex: false,

  // Sort
  sortType: { type: 'alphabetical', order: 'asc' },
};

export default defaultWebsiteData;
