import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@picsio/ui';
import { useSelector } from 'react-redux';
import Logger from '../../services/Logger';

const PlaceholderInboxes = () => {
  const { activeInboxID, inboxes } = useSelector((state) => state.inboxes);
  const [activeInbox, setActiveInbox] = useState({});

  useEffect(() => {
    const inbox = inboxes.find(i => i._id === activeInboxID);
    if (inbox) {
      setActiveInbox(inbox);
    }
  }, [activeInboxID, inboxes, setActiveInbox]);

  return (
    <>
      <div className="placeholderEmptyTitle">
        Inbox is a web-page that allows external users to upload files into your library without
        adding them to your team
      </div>
      <div className="placeholderEmptyText">
        <Choose>
          <When condition={activeInbox?.isShared}>
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                window.open(`https://${activeInbox.alias}`, '_blank');
                Logger.log('User', 'OpenInbox');
              }}
            >
              Add
            </Button>
          </When>
          <Otherwise>
            Publish this inbox and add
          </Otherwise>
        </Choose>
        {' '}a few files into your library. Once they’re added, they will show up here.<br />
        More details on{' '}
        <Button
          variant="text"
          color="primary"
          onClick={() => {
            window.open('https://help.pics.io/en/articles/4066282-inbox', '_blank');
            Logger.log('User', 'Help', 'Inbox');
          }}
        >How to add files via inboxes
        </Button>{' '} to a library.
      </div>
    </>
  );
};

PlaceholderInboxes.propTypes = {};

export default PlaceholderInboxes;
