import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from '@picsio/ui';
import styled from 'styled-components';
import Logger from '../../services/Logger';
import { Input } from '../../UIComponents';
import Icon from '../Icon';
import localization from '../../shared/strings';
import copyTextToClipboard from '../../helpers/copyTextToClipboard';

const Website = (props) => {
  const { isOpen, toggleCollapseVisibility, website } = props;
  const { customGalleryTitle, logoUrl, alias } = website;

  const copyToClipboard = (e) => {
    Logger.log('User', 'CollectionInfoWebsiteCopyLink');
    // eslint-disable-next-line no-new
    const websiteURL = e.currentTarget.dataset.value;
    const toastText = localization.DETAILS.websiteUrlCopied;
    copyTextToClipboard(websiteURL, toastText);
  };

  return (
    <Collapse
      fontSize="md"
      isOpen={isOpen}
      onClick={() => {
        toggleCollapseVisibility('website');
      }}
      title="Website"
      transition
    >
      <div className="PicsioCollapse__content--inner">
        <If condition={customGalleryTitle}>
          <div className="InfoPanel__Row">
            <span className="InfoPanel__Row--label">Title:</span>
            {customGalleryTitle}
          </div>
        </If>
        <If condition={logoUrl}>
          <div className="InfoPanel__Row">
            <span className="InfoPanel__Row--label">Logo:</span>
            <StyledWebsiteLogo src={logoUrl} alt="" />
          </div>
        </If>
      </div>
      <div className="fieldCopyTo">
        <Input value={alias} className="fieldCopyToUrl" />
        <div
          className="picsioDefBtn picsioLinkForShare fieldCopyToBtn"
          data-value={alias}
          onClick={copyToClipboard}
        >
          <Icon name="copyToClipboard" />
        </div>
      </div>
    </Collapse>
  );
};

Website.defaultProps = {
  isOpen: true,
};

Website.propTypes = {
  isOpen: PropTypes.bool,
  website: PropTypes.shape({
    customGalleryTitle: PropTypes.string,
    logoUrl: PropTypes.string,
    alias: PropTypes.string.isRequired,
  }).isRequired,
  toggleCollapseVisibility: PropTypes.func.isRequired,
};

export default memo(Website);

const StyledWebsiteLogo = styled.img`
  max-width: 200px;
  display: block;
  margin: 10px 0 22px;
`;
