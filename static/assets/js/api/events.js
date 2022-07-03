import picsioConfig from '../../../../config';

/**
 * Emit Facebook Event
 * @param {string} action
 * @param {(string|Object)} label
 */
export const emitFBEvent = (action, label) => {
	if (!action) {
		throw new Error('action is required');
	}

	if (!fbEvents[action]) {
		throw new Error(`action "${action}" is undefined`);
	}

	sendFBEvent(action, label);
};

const sendFBEvent = (action, label) => {
	const eventName = fbEvents[action].name;
	const eventLabel = fbEvents[action].isLabelAllowed && label;

	const pixel = new Image(1, 1);
	pixel.src = `https://www.facebook.com/tr?id=${picsioConfig.facebook.id}&ev=${eventName}`;
	if (eventLabel) {
		pixel.src += `&cd[value]=${eventLabel}`;
	}
};

export const fbEvents = {
	AppStarted: {
		name: 'Lead',
		isLabelAllowed: false,
	},
	SubscriptionChanged: {
		name: 'Subscribe',
		isLabelAllowed: true,
	},
};
