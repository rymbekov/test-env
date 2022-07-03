import store from '../../store';

const isUserOnS3 = () => store.getState().user.team.storageType === 's3';

export const configErrors = {
	204: {
		icon: 'broken',
		text: 'file is empty and can\'t be used',
		btn: 'delete',
		onClick: 'handleDeleteForever',
		iconColor: '#474747',
		selectable: false,
	},
	205: {
		icon: 'notSupportedVideo',
		text: 'This video format is not supported yet',
		iconColor: '#474747',
		selectable: true,
	},
	401: {
		icon: 'noAccessCatalogItem',
		text: 'insufficient rights <br />to access the preview',
		iconColor: '#474747',
	},
	404: {
		icon: 'notFoundCatalogItem',
		text: () => (isUserOnS3() ? 'file not found <br />in Amazon S3 Bucket' : 'file not found <br />in  Google Drive'),
		btn: 'delete',
		onClick: 'handleRemoveNotFoundAssets',
		iconColor: '#474747',
		fullWidth: true,
	},
	noPermissions: {
		icon: 'error',
		text: 'No permissions to access',
		btn: 'Remove from lightboard',
		onClick: 'handleRemoveLightboard',
		iconColor: '#474747',
		selectable: true,
		fullWidth: true,
	},
	// this code is not returned by google drive but we can use it to handle situation when file is trashed, but exists in our database
	456: {
		icon: 'notFoundCatalogItem',
		text: () => (isUserOnS3() ? 'file is trashed <br />in Amazon S3 Bucket' : 'file is trashed <br />in Google Drive'),
		btn: 'delete',
		onClick: 'handleRemoveNotFoundAssets',
		iconColor: '#474747',
		fullWidth: true,
	},
	500: {
		icon: 'notGeneratedCatalogItem',
		text: 'preview could not be <br />generated',
		iconColor: '#474747',
	},

	thumbnailing: {
		icon: 'generationThumbnailCatalogItem',
		text: 'generating <br />thumbnail',
		iconColor: '#474747',
	},

	locked: {
		icon: 'lockedCatalogItem',
		text: 'picture <br />is locked',
		iconColor: '#474747',
	},
};

export const getConfigDefaultPlaceholder = () => ({
	icon: 'noPreviewCatalogItem',
	text: 'no preview <br />available',
	iconColor: '#474747',
});

export const configFormats = {
	ai: {
		icon: 'aiCatalogItem',
		text: 'AI',
	},
	eps: {
		icon: 'epsCatalogItem',
		text: 'EPS',
	},
	mp3: {
		icon: 'mp3CatalogItem',
		text: 'MP3',
	},
	wav: {
		icon: 'wavCatalogItem',
		text: 'WAV',
	},
	aiff: {
		icon: 'mp3CatalogItem',
		text: 'AIFF',
	},
	sketch: {
		icon: 'sketchCatalogItem',
		text: 'generating <br />thumbnail',
		iconColor: '#FFCC00',
	},
	obj: {
		icon: 'file3d',
		text: 'OBJ',
	},
};

export const configGApps = {
	'application/vnd.google-apps.form': {
		icon: 'googleForm',
		text: 'Google Form',
	},
	'application/vnd.google-apps.site': {
		icon: 'googleSite',
		text: 'Google Site',
	},
	'application/vnd.google-apps.spreadsheet': {
		icon: 'googleSheet',
		text: 'Google Spreadsheet',
	},
	'application/vnd.google-apps.presentation': {
		icon: 'googlePresentation',
		text: 'Google Presentation',
	},
	'application/vnd.google-apps.document': {
		icon: 'googleDocument',
		text: 'Google Document',
	},
	'application/vnd.google-apps.drawing': {
		icon: 'googleDrawing',
		text: 'Google Drawing',
	},
};
