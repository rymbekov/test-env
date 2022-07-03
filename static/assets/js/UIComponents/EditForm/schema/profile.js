import { object, string } from 'yup';

import validation from './validation';

export default object().shape({
	email: string().email(),
	displayName: validation.displayName,
	position: string(),
	phone: string(),
	slackUserId: validation.slackUserId,
	blogUrl: validation.url,
	facebookUrl: validation.facebookUrl,
	instagramUrl: validation.instagramUrl,
	twitterUrl: validation.twitterUrl,
	about: string(),
	contacts: string(),
});
