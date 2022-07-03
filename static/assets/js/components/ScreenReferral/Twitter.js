import React, { useState } from 'react';
import { Textarea, Button } from '../../UIComponents';
import Logger from '../../services/Logger';

const defaulrMessage = `Hey!
I had a great experience with @Pics.io! If you need a perfect tool to manage your digital collateral signup and get a $50 welcome bonus:`;
const TwitterForm = ({ referralLink }) => {
  const [message, setMessage] = useState(defaulrMessage);

  const handleSubmit = (e) => {
    Logger.log('User', 'ReferralTwitterFormSubmit');
    e.preventDefault();

    const shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(
      referralLink,
    )}`;

    window.open(shareLink);
  };

  return (
    <form className="sendInvitesForm" onSubmit={handleSubmit}>
      <label htmlFor="sendInvitesForm" className="formLabel">
        Share on Twitter
      </label>
      <div className="sendInvitesInput">
        <Textarea
          className="formInputMain sendInvitesInnerText"
          wrap="soft"
          label="Message"
          defaultValue={message}
          onBlur={() => Logger.log('User', 'ReferralTwitterMessageChange')}
          onChange={(e) => setMessage(e.target.value)}
          height={100}
        />
      </div>

      <div className="submitLine">
        <Button id="button-tweet" className="buttonAction" type="submit">
          Tweet
        </Button>
      </div>
    </form>
  );
};

export default TwitterForm;
