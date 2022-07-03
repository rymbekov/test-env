import { object, string } from 'yup';

import validation from './validation';

export default object().shape({
	displayName: validation.displayName,
	position: string(),
	phone: string(),
	slackUserId: string(),
});
