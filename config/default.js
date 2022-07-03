module.exports = {
	RECAPTCHA_KEY: '6LfCzvcUAAAAALTVHKbjKuGhLXuR_WDss2imdO8a',
	bundledAt: process.env.bundledAt,
	bundleName: process.env.bundleName,
	OLD_BROWSER_URL: '/ancient',

	getApiBaseUrl() {
		if (window.Picsio && window.Picsio.apiBaseUrl) return window.Picsio.apiBaseUrl;
		return 'https://pics.io';
	},

	getInboxApiBaseUrl() {
		return 'https://inboxes.pics.io';
	},

	isProofing() {
		return process.env.appType === 'proofing';
	},
	isMainApp() {
		return process.env.appType === 'main';
	},
	isSingleApp() {
		return process.env.appType === 'single';
	},
	isInboxApp() {
		return process.env.appType === 'inbox';
	},
	isSpeechRecognition: () => 'webkitSpeechRecognition' in window,

	browser: {
		Chrome: 32,
		Firefox: 27,
		Safari: 7,
	},

	support: {
		HELP_CENTER_URL: 'https://help.pics.io',
	},
	paths: {
		RESET_PASSWORD_PATH: '/forgot?email=',
	},
	proxy: {
		BASE_URL: 'https://proxy.pics.io',
	},
	version: {
		cookiesName: 'picsio.version',
	},

	editor: {
		export: {
			mimeType: 'image/jpeg',
		},
	},

	facebook: {
		id: 1562535593796750,
	},

	formats: {
		SUPPORTED_DIFF_FORMATS: [
			'image/jpg',
			'image/jpeg',
			'image/png',
			'image/gif',
			'application/x-photoshop',
			'image/x-photoshop',
			'image/vnd.adobe.photoshop',
			'image/svg+xml',
			'image/webp',
			'image/bmp',
			'application/postscript',
		],
		SUPPORTED_PLAYING_FORMATS: {
			Chrome: ['video/quicktime', 'video/webm', 'video/mp4', 'video/x-m4v', 'video/x-f4v'], // mpg,avi,mpeg,3gp,flv,ogg (support by Google)
			Firefox: ['video/quicktime', 'video/mp4', 'video/ogg', 'video/webm', 'video/x-f4v', 'video/x-m4v'], // mpg,avi,mpeg,3gp,flv (support by Google)
			Safari: [
				'video/quicktime', // mov
				'video/mp4',
				'video/x-m4v',
				'video/3gpp',
			], // mpg,avi,mpeg,flv,webm (support by Google)
		},
		REQUIRE_ACCESSTOKEN_IN_URL: [
			'application/vnd.google-apps.form',
			'application/vnd.google-apps.site',
			'application/vnd.google-apps.spreadsheet',
			'application/vnd.google-apps.presentation',
			'application/vnd.google-apps.document',
			'application/vnd.google-apps.drawing',
		],
		// Google Drive’s formats cannot be downloaded, and some of them do not have revisions.
		SPECIFIC_FORMATS: {
			'application/vnd.google-apps.form': {
				isDownloadable: false,
				revisions: false,
			},
			'application/vnd.google-apps.map': {
				isDownloadable: false,
				revisions: false,
			},
			'application/vnd.google-apps.site': {
				isDownloadable: false,
				revisions: false,
			},
			'application/vnd.google-apps.spreadsheet': {
				isDownloadable: false,
				revisions: true,
			},
			'application/vnd.google-apps.presentation': {
				isDownloadable: false,
				revisions: true,
			},
			'application/vnd.google-apps.document': {
				isDownloadable: false,
				revisions: true,
			},
			'application/vnd.google-apps.drawing': {
				isDownloadable: false,
				revisions: true,
			},
			'application/vnd.google-apps.jam': {
				isDownloadable: false,
				revisions: false,
			},
		},
		EDITABLE_MIME_TYPES: [
			'image/jpg',
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/x-adobe-dng',
			'image/x-canon-cr2',
			'image/x-nikon-nef',
			'image/x-sony-arw',
			'image/x-fuji-raf',
			'image/tiff',
			'image/x-tiff',
			'image/x-icon',
			'application/sketch',
			'application/postscript',
			'application/pdf',
			'application/x-photoshop',
			'image/x-photoshop',
			'image/x-portable-pixmap',
			'image/emf',
			'image/vnd.adobe.photoshop',
			'image/svg+xml',
			'image/webp',
			'image/bmp',
		],
		CONVERTIBLE_EXTENSIONS: [
			'jpg',
			'jpeg',
			'png',
			'gif',
			'tif',
			'tiff',
			'nef',
			'cr2',
			'cr3',
			'dng',
			'arw',
			'orf',
			'crw',
			'erf',
			'srf',
			'dcr',
			'raw',
			'rw2',
			'raf',
			'x3f',
			'pef',
			'srw',
			'psd',
			'eps',
			'ai',
			'heic',
			'heif',
      'svg'
		],
	},

	sentry: {
		dsn: 'https://f615967b610a41e19441dca617c02c46@sentry.io/1296562',
	},

	amplitude: {
		mainKey: 'c4ef494ba31a4ebbe0785660dac0c57a', // main App
		externalKey: '6261732b82931d8d8aa7bba74dd9fe88', // proofing, sas, inboxes...
		devKey: '437a04ff0204f485a84656245f666437', // test
	},

	events: {
		sessionKey: 'picsio.sid.l',
	},

	google: {
		mainApp: '190238897195.apps.googleusercontent.com',
		gSuiteApp: '563672377085-o36vr1s0d8hu1c68684hei7l6rt4tr0q.apps.googleusercontent.com',
	},

	DRAG_ASSETS_EVENT_CONTENT: '*** assets is moved ***',
	DRAG_KEYWORD_EVENT_CONTENT: '*** keyword is moved ***',
};
