import React, { useState } from 'react';
import { Textarea, Button } from '../../UIComponents';
import Logger from '../../services/Logger';

const defaultMessage = `Hi,
Thought you’d really like Pics.io! I’ve used this service for some time and forgot about the mess across my digital files. It helps to manage digital collateral - pictures, videos, PDFs and so on. I have had a really good experience with that.
If you also suffer from files organization problems I believe Pics.io can become your savior. I would also recommend it for teamwork as you can easily share and collaborate on files together with your colleagues.
Sign up to Pics.io now through this link

You’ll get a $50 welcome bonus as you receive this link from me. :)
I hope you’ll love this program as I do.
Cheers!`;

const LinkedinForm = ({ referralLink, copyToClipboard }) => {
  const [message, setMessage] = useState(defaultMessage);

  const handleSubmit = (e) => {
    Logger.log('User', 'ReferralLinkedinFormSubmit');
    e.preventDefault();

    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      referralLink
    )}&source=${encodeURIComponent(referralLink)}`;

    window.open(url);
  };

  return (
    <form className="sendInvitesForm" onSubmit={handleSubmit}>
      <label htmlFor="sendInvitesForm" className="formLabel">
        Share on Linkedin
      </label>

      <p className="shareInstruction">
        Please follow these steps to share this message on Linkedin: <br />
        1. Copy the message to clipboard. <br />
        2. Click "Share" button. <br />
        3. Choose share in a post or send as private message. <br />
        4. Paste the message within the Linkedin. <br />
        5. Share a post. <br />
      </p>

      <div className="sendInvitesInput">
        <Textarea
          className="formInputMain sendInvitesInnerText"
          wrap="soft"
          label="Message"
          defaultValue={message}
          onBlur={() => Logger.log('User', 'ReferralLinkedinMessageChange')}
          onChange={(e) => setMessage(e.target.value)}
          height={275}
        />
      </div>

      <div className="submitLine">
        <Button
          id="button-copyLink"
          className="copyToClipboardButton"
          icon="copyToClipboard"
          onClick={() => {
            Logger.log('User', 'ReferralLinkedinMessageCopy');
            copyToClipboard(message, document.querySelector('.sendInvitesInnerText'));
          }}
        >
          Copy to clipboard
        </Button>

        <Button id="button-share" className="buttonAction" type="submit">
          Share
        </Button>
      </div>
    </form>
  );
};

export default LinkedinForm;
