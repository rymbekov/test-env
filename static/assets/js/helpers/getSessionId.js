import * as utils from '../shared/utils';
import picsioConfig from '../../../../config';

export default function() {
	const picsioSessionId = utils.getCookie(picsioConfig.events.sessionKey);
	if (!picsioSessionId) return null;

	return picsioSessionId.slice(2).split('.')[0];
}
