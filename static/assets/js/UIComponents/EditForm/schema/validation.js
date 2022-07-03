import { string } from 'yup';

import localization from '../../../shared/strings';

import { FACEBOOK, TWITTER, INSTAGRAM } from './placeholders';

const urlError = localization.ACCOUNT.errorLinkNotValid;
const urlMatchError = localization.ACCOUNT.errorLinkStartURL;

export default {
  displayName: string().max(500, 'Allowed characters limit of 500 is exceeded. Remove characters.').required('Should always exists'),
  url: string().url(urlError),
  facebookUrl: string()
    .url(urlError)
    .matches(/^https:\/\/www.facebook.com\//, {
      message: `${urlMatchError} ${FACEBOOK}`,
      excludeEmptyString: true,
    }),
  twitterUrl: string()
    .url(urlError)
    .matches(/^https:\/\/www.twitter.com\//, {
      message: `${urlMatchError} ${TWITTER}`,
      excludeEmptyString: true,
    }),
  instagramUrl: string()
    .url(urlError)
    .matches(/^https:\/\/www.instagram.com\//, {
      message: `${urlMatchError} ${INSTAGRAM}`,
      excludeEmptyString: true,
    }),
  slackUserId: string(),
};
