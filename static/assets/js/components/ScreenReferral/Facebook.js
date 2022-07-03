import React, { useState } from 'react';
import { Textarea, Button } from '../../UIComponents';
import Logger from '../../services/Logger';

const defaultMessage = `Hey!
You know, I finally solved my problem with the files’ organization using Pics.io. This service helps to manage digital collateral - pictures, videos, PDFs and so on.
I have had a really good experience with that.
I believe you have similar challenges in keeping up with your files. So I thought that you can benefit from Pics.io as well.
Please use the link below to signup and you will get a $50 welcome bonus on your account as you receive this link from me :)

I hope you’ll love this program as I do.`;

const FacebookForm = ({ referralLink, copyToClipboard }) => {
  const [message, setMessage] = useState(defaultMessage);

  const handleSubmit = (e) => {
    Logger.log('User', 'ReferralFacebookFormSubmit');
    e.preventDefault();

    const url = `https://www.facebook.com/dialog/share?app_id=720987181295084&display=page&href=${encodeURIComponent(
      referralLink
    )}`;

    window.open(url);
  };

  return (
    <form className="sendInvitesForm" onSubmit={handleSubmit}>
      <label htmlFor="sendInvitesForm" className="formLabel">
        Share on Facebook
      </label>

      <p className="shareInstruction">
        Please follow these steps to share this message on Facebook: <br />
        1. Copy the message to clipboard. <br />
        2. Click "Share" button. <br />
        3. Paste the message within the Facebook. <br />
        4. Share a post. <br />
      </p>

      <div className="sendInvitesInput">
        <Textarea
          className="formInputMain sendInvitesInnerText"
          wrap="soft"
          label="Message"
          value={message}
          onBlur={() => Logger.log('User', 'ReferralFacebookMessageChange')}
          onChange={(e) => setMessage(e.target.value)}
          height={240}
        />
      </div>

      <div className="submitLine">
        <Button
          id="button-copyLink"
          className="copyToClipboardButton"
          icon="copyToClipboard"
          onClick={() => {
            Logger.log('User', 'ReferralFacebookMessageCopy');
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

export default FacebookForm;
