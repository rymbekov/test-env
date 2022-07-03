import React, { useState } from 'react';

import Logger from '../../services/Logger';

import EmailForm from './Email';
import LinkedinForm from './Linkedin';
import TwitterForm from './Twitter';
import FacebookForm from './Facebook';
import Link from './Link';

const MainForm = ({ userId, referralLinks, copyToClipboard }) => {
  const [currentFormName, setCurrentFormName] = useState('email');
  const [referralLink, setReferralLink] = useState(
    `https://pics.io/hello?utm_source=picsio&utm_medium=${name}&utm_campaign=referral&utm_content=${userId}`
  );

  const handleButtonClick = (name) => {
    setCurrentFormName(name);
    setReferralLink(
      `https://pics.io/hello?utm_source=picsio&utm_medium=${name}&utm_campaign=referral&utm_content=${userId}`
    );
  };

  return (
    <div className="sendInvites">
      <div className="formLeftSide">
        <If condition={currentFormName === 'email'}>
          <EmailForm referralLink={referralLink} />
        </If>
        <If condition={currentFormName === 'linkedin'}>
          <LinkedinForm referralLink={referralLink} copyToClipboard={copyToClipboard} />
        </If>
        <If condition={currentFormName === 'twitter'}>
          <TwitterForm referralLink={referralLink} />
        </If>
        <If condition={currentFormName === 'facebook'}>
          <FacebookForm referralLink={referralLink} copyToClipboard={copyToClipboard} />
        </If>
        <If condition={currentFormName === 'link'}>
          <Link referralLink={referralLink} />
        </If>
      </div>

      <div className="formRightSide">
        <div className="socialMedia">
          <button
            className={currentFormName === 'email' ? 'shareButton emailAct' : 'shareButton'}
            onClick={() => {
              Logger.log('User', 'ReferralEmailFormOpen');
              handleButtonClick('email');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12">
              <path d="M2 10V3l5.45 3.737c.17.113.36.175.55.175.19 0 .38-.062.55-.175L14 3.04V10zm10-8L7.976 5 4 2zm2-2H2C.9 0 0 .9 0 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z" />
            </svg>
          </button>
          <button
            className={currentFormName === 'linkedin' ? 'shareButton linkedinAct' : 'shareButton'}
            onClick={() => {
              Logger.log('User', 'ReferralLinkedinFormOpen');
              handleButtonClick('linkedin');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
              <path d="M10.997 13.125v-4.74c0-1.187-.431-2.005-1.522-2.005-.827 0-1.324.547-1.54 1.076-.078.188-.102.453-.102.718v4.945H4.83s.042-8.027 0-8.862h3.003v1.265c.396-.606 1.109-1.465 2.703-1.465 1.978 0 3.458 1.265 3.458 3.987v5.081zM1.678 3.058H1.66C.653 3.058 0 2.376 0 1.528 0 .659.671 0 1.696 0s1.66.664 1.678 1.529c0 .847-.647 1.529-1.696 1.529zm1.504 10.067H.18V4.263h3.002zm4.694-7.538v-.053c-.012.021-.023.032-.035.053z" />
            </svg>
          </button>
          <button
            className={currentFormName === 'facebook' ? 'shareButton facebookAct' : 'shareButton'}
            onClick={() => {
              Logger.log('User', 'ReferralFacebookFormOpen');
              handleButtonClick('facebook');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="16">
              <path d="M7.111 2.729H5.514c-.56 0-.76.339-.76.813v1.622H7.11l-.28 2.859H4.753V16H1.597V8.023H0v-2.86h1.597v-1.62C1.597 1.62 2.194.084 4.753 0h2.358z" />
            </svg>
          </button>
          <button
            className={currentFormName === 'twitter' ? 'shareButton twitterAct' : 'shareButton'}
            onClick={() => {
              Logger.log('User', 'ReferralTwitterFormOpen');
              handleButtonClick('twitter');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="13">
              <path d="M4.717 12.19c5.661 0 8.757-4.689 8.757-8.755 0-.134-.003-.266-.01-.398A6.26 6.26 0 0 0 15 1.443a6.143 6.143 0 0 1-1.767.485A3.088 3.088 0 0 0 14.586.225a6.167 6.167 0 0 1-1.954.747A3.078 3.078 0 0 0 7.388 3.78 8.737 8.737 0 0 1 1.043.564a3.075 3.075 0 0 0 .953 4.108 3.055 3.055 0 0 1-1.394-.385v.04A3.079 3.079 0 0 0 3.07 7.342a3.086 3.086 0 0 1-1.39.053 3.081 3.081 0 0 0 2.875 2.138A6.175 6.175 0 0 1 0 10.808a8.713 8.713 0 0 0 4.717 1.383" />
            </svg>
          </button>
          <button
            className={currentFormName === 'link' ? 'shareButton linkAct' : 'shareButton'}
            onClick={() => {
              Logger.log('User', 'ReferralLinkFormOpen');
              handleButtonClick('link');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="10">
              <path d="M20 5c0 2.76-2.24 5-5 5h-4V8.1h4c1.71 0 3.1-1.39 3.1-3.1 0-1.71-1.39-3.1-3.1-3.1h-4V0h4c2.76 0 5 2.24 5 5zM6 4h8v2H6zM5 8.1h4V10H5c-2.76 0-5-2.24-5-5s2.24-5 5-5h4v1.9H5C3.29 1.9 1.9 3.29 1.9 5c0 1.71 1.39 3.1 3.1 3.1z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainForm;
