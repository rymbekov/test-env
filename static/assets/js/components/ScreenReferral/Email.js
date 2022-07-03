import React, { useState, useEffect } from 'react';
import {
  Input, Checkbox, Textarea, Button,
} from '../../UIComponents';
import localization from '../../shared/strings';
import { isValidEmailAddress } from '../../shared/utils';
import Logger from '../../services/Logger';

const CC_EMAIL = 'demo@pics.io';

const defaultSubject = 'Thought you’d really enjoy Pics.io';
const defaultMessageStart = `Hi,
Some time ago I’ve started using Pics.io and forgot about the mess across my digital files.
This service helps to manage digital collateral - pictures, videos, PDFs and so on. I have had a really good experience with that.
If you also suffer from files organization problems I believe Pics.io can become your savior.

I would also recommend it for teamwork as you can easily share and collaborate on files together with your colleagues.
Sign up to Pics.io now through this link

`;
const defaultMessageEnd = `You’ll get a $50 welcome bonus as you receive this link from me. :)
I hope you’ll love this program as I do.
Cheers!

`;
const messageForDemo = `I know that you’re busy, so I put the Pics.io account executive guy into a copy of this email.
He can do a really informative free of charge demo tailored for your workflow.
Please feel free to email him to schedule a demo or in case you have any questions.

`;

const EmailForm = ({ referralLink }) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [isRecommendDemo, setRecommendDemo] = useState(false);
  const [message, setMessage] = useState('');
  const [isEmailValue, setEmailValid] = useState(true);
  const [isMessageChanged, setMessageChanged] = useState(false);
  referralLink += `

`;

  const handleSubmit = (e) => {
    Logger.log('User', 'ReferralEmailFormSubmit');
    e.preventDefault();
    isValidEmailAddress(email) ? setEmailValid(true) : setEmailValid(false);
    let url = '';

    if (isRecommendDemo) {
      url = `mailto:${email}?cc=${CC_EMAIL}&subject=${subject}&body=${encodeURIComponent(message)}`;
    } else {
      url = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(message)}`;
    }
    if (isEmailValue) {
      window.open(url);
    }
    return false;
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setEmailValid(isValidEmailAddress(value));
    setEmail(value);
  };

  const handleCheckboxChange = () => {
    const value = !isRecommendDemo;
    Logger.log('User', 'ReferralEmailDemoChange', value);
    setRecommendDemo(value);
    let newMessage;
    if (isMessageChanged) {
      newMessage = value ? message + messageForDemo : message.replace(messageForDemo, '');
    } else {
      newMessage = value
        ? defaultMessageStart + referralLink + messageForDemo + defaultMessageEnd
        : defaultMessageStart + referralLink + defaultMessageEnd;
    }

    setMessage(newMessage);
  };

  const handleMessageChange = (e) => {
    setMessageChanged(true);
    setMessage(e.target.value);
  };

  useEffect(() => {
    setMessage(defaultMessageStart + referralLink + defaultMessageEnd);
  }, [referralLink]);

  return (
    <form className="sendInvitesForm" onSubmit={handleSubmit}>
      <label htmlFor="sendInvitesForm" className="formLabel">
        Share by email
      </label>
      <div className="sendInvitesInput sendInvitesInputMail">
        <Input
          className="formInputMail"
          label="Email address"
          type="text"
          placeholder="carl@mail.com"
          error={!isEmailValue && localization.CONFIRM.emailInvalid}
          onBlur={() => Logger.log('User', 'ReferralEmailChange')}
          onChange={handleEmailChange}
          defaultValue={email}
        />
        <Checkbox label="Recommend product demo" value={isRecommendDemo} onChange={handleCheckboxChange} />
      </div>

      {isRecommendDemo && (
        <div className="sendInvitesInput ">
          <Input className="formInputMail" label="CC Email" type="text" value={CC_EMAIL} readonly />
        </div>
      )}

      <div className="sendInvitesInput ">
        <Input
          className="formInputSubject"
          label="Subject"
          type="text"
          defaultValue={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="sendInvitesInput">
        <Textarea
          className="formInputMain sendInvitesInnerText"
          wrap="soft"
          label="Message"
          value={message}
          onBlur={() => Logger.log('User', 'ReferralEmailMessageChange')}
          onChange={handleMessageChange}
          height={280}
        />
      </div>

      <div className="submitLine">
        <Button id="button-send" className="buttonAction" type="submit" disabled={!email || !isEmailValue}>
          Send Email
        </Button>
      </div>
    </form>
  );
};

export default EmailForm;
