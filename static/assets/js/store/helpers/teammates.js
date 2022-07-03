import dayjs from 'dayjs';
import store from '../index';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';

/**
 * Normalize avatar src
 * @param {string} src
 * @param {string?} size
 * @param {boolean?} retina
 * @returns {string}
 */
export function normalizeUserAvatarSrc(src, size, retina) {
	let normalizedUrl = src || '';
	if (normalizedUrl && normalizedUrl.startsWith('https://s3.amazonaws.com/content.pics.io/original/users')) {
		const url = new URL(normalizedUrl);

		// isSearchSuffix we use to test many avatars per team
		const isSearchSuffix = url && url.search;

		// temporary removing the suffix
		if (isSearchSuffix) {
			normalizedUrl = normalizedUrl.replace(isSearchSuffix, '');
		}

		const ext = utils.getFileExtension(normalizedUrl);
		let imageSize = '128';
		switch (size) {
			case "large": {
				imageSize = '128';
				break;
			}
			case "medium": {
				imageSize = '32';
				break;
			}
			case "small": {
				imageSize = '16';
				break;
			}
			default:
				break;
		}

		if (retina) imageSize += '@2x';
		normalizedUrl = normalizedUrl.replace('/original', '');
		normalizedUrl = normalizedUrl.replace(ext, `${imageSize}.${ext}`);

		// returning the suffix back
		if (isSearchSuffix) {
			normalizedUrl += isSearchSuffix;
		}
	}
	return normalizedUrl;
}

/**
 * Normalize users
 * @param {Object},
 */
export function normalizeUsers(users) {
	const newUsers = users.map((user) => normalizeUser(user));
	return newUsers;
}

/**
 * Normalize user
 * @param {Object},
 */
export function normalizeUser(user) {
	const roles = store.getState().roles.items;
	const { parent } = user;
	const teammateRoleId = parent && parent.teammateRoleId;

	let roleName = null;
	let isRoleError = null;
	if (teammateRoleId) {
		const role = roles.find((role) => role._id === teammateRoleId);
		roleName = role && role.name;
		isRoleError = role && role.error;
	}

	return {
		_id: user._id,
		displayName: user.displayName,
		email: user.email.toLowerCase(),
		avatarOriginal: user.avatar || '',
		avatar: normalizeUserAvatarSrc(user.avatar, 'large'),
		isOwner: !roleName,
		parent,
		roleName: roleName || localization.TEAMMATES.textTeamOwner,
		isRoleError,
		roleId: teammateRoleId,
		isActive: user.act,
		status: !roleName ? 'owner' : getStatus(user),
		slackUserId: user.slackUserId || '',
		facebookUrl: user.facebookUrl || '',
		phone: user.phone || '',
		position: user.position || '',
		about: user.about || '',
		twoFactorConfigured: user.twoFactorConfigured || false,
		visitedAt:
			user.parent && user.parent.confirmed === true && user.visitedAt
				? dayjs().from(user.visitedAt)
				: localization.TEAMMATES.textNoAnswer,
	};
}

export function getStatus(user) {
	const STATUS = {
		invited: localization.TEAMMATES.statusInvited,
		requested: localization.TEAMMATES.statusRequested,
		rejected: localization.TEAMMATES.statusRejected,
		accepted: localization.TEAMMATES.statusAccepted,
		reinvited: localization.TEAMMATES.statusReinvited,
	};

	if (user.parent.reinvited) return STATUS.reinvited;
	if (user.parent.confirmedByTeam === false) return STATUS.requested;
	if (user.parent.confirmed === false) return STATUS.rejected;
	if (user.parent.confirmed) return STATUS.accepted;

	return STATUS.invited;
}

export function updateTeammate(state, { payload }) {
	const { index, field, value } = payload;

	state.items[index][field] = value;
}
