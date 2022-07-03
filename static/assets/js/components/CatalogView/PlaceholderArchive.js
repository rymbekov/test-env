import React from 'react';
import { Button } from '@picsio/ui';
import Logger from '../../services/Logger';

const PlaceholderArchive = () => (
  <div className="placeholderArchive">
    <div className="placeholderEmptyTitle">
      Archive is a separate space to retire unused and outdated/expired assets<br/> to when you want to repurpose them in the future
    </div>
    <div className="placeholderEmptyText">
      More details on {' '}
      <Button
        variant="text"
        color="primary"
        onClick={() => {
          window.open('https://help.pics.io/en/articles/5138010-archive', '_blank');
          Logger.log('User', 'Help', 'Archive');
        }}
      >
        How to archive assets
      </Button>
    </div>
  </div>
);

export default PlaceholderArchive;
