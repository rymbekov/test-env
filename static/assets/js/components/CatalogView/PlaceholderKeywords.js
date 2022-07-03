import React from 'react';
import { Button } from '@picsio/ui';
import Logger from '../../services/Logger';

const PlaceholderKeywords = () => (
  <div className="placeholderKeywords">
    <div className="placeholderEmptyTitle">
      There are no assets connected to this keyword
    </div>
    <div className="placeholderEmptyText">
      Go to your library and attach this keyword to an asset,
      or read more on{' '}
      <Button
        variant="text"
        color="primary"
        onClick={() => {
          window.open('https://help.pics.io/en/articles/1269302-keywords-general-info', '_blank');
          Logger.log('User', 'Help', 'Keywords');
        }}
      >
        How to tag asssets with keyword
      </Button>
    </div>
    <div className="placeholderEmptyVideo">
      <iframe width="560" height="315" src="https://www.youtube.com/embed/De6c3L7aw_A" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </div>
  </div>
);

export default PlaceholderKeywords;
