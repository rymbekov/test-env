import React from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';
import Logger from '../../services/Logger';

const PlaceholderOtherFilters = ({ collectionName }) => {
  const picsioStorage = useSelector((state) => state.user.picsioStorage);
  const chatSupport = useSelector((state) => state.user.subscriptionFeatures?.chatSupport);

  const handleLiveSupport = () => {
    if (chatSupport) {
      window.dispatchEvent(new Event('toolbar:ui:liveSupport'));
      Logger.log('User', 'SearchNothingFoundImportOfferClicked');
    }
  };

  return (
    <Choose>
      <When condition={picsioStorage}>
        <div className="placeholderEmptyContainer">
          <p>No assets found in a collection
            <span className="act">&nbsp;{collectionName}&nbsp;</span>
            that match your search query.
          </p>
          <p>This may be because some files are still somewhere in
            Dropbox or personal Google Drives of your teammates.
            We can move over all those files to this library.
          </p>
          <button
            id="itemliveSupport"
            type="button"
            className="placeholderEmptyButton btnCallToAction picsioDefBtn"
            onClick={handleLiveSupport}
            data-testId="catalogView-liveSupportButton"
          >
            Yes, help me with the import
          </button>
        </div>
      </When>
      <Otherwise>
        <div className="placeholderEmptyTitle">
          No assets found in a collection
          <span className="act">&nbsp;{collectionName}&nbsp;</span>
          that match your search query.
        </div>
      </Otherwise>
    </Choose>
  );
};

PlaceholderOtherFilters.propTypes = {
  collectionName: string.isRequired,
};

export default PlaceholderOtherFilters;
