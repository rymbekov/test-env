import { object, string } from 'yup';

import validation from './validation';

export default object().shape({
	position: string(),
	phone: string(),
	facebookUrl: validation.facebookUrl,
	slackUserId: string(),
	about: string(),
});
