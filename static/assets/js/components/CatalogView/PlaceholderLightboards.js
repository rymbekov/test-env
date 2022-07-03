import React from 'react';
import { Button } from '@picsio/ui';
import Logger from '../../services/Logger';

const PlaceholderLightboards = (props) => (
  <>
    <div className="placeholderEmptyTitle">
      Lightboards are private folders where you can store your personal assets.
    </div>
    <div className="placeholderEmptyText">
      Add a few files into your lightboard. Once they’re added, they will show up here.<br />
      More details on  {' '}
      <Button
        variant="text"
        color="primary"
        onClick={() => {
          window.open('https://help.pics.io/en/articles/1748810-lightboards-personal-collections-inside-pics-io', '_blank');
          Logger.log('User', 'Help', 'Lightboard');
        }}
      >
        How to add files via lightboards
      </Button>
      {' '} to a library.
    </div>
  </>
);

PlaceholderLightboards.propTypes = {};

export default PlaceholderLightboards;
