import React, { memo } from 'react';
import PropTypes from 'prop-types';

import {
  Download,
  DownloadList,
  Collections,
} from '@picsio/ui/dist/icons';
import picsioConfig from '../../../../../config';
import ErrorBoundary from '../ErrorBoundary';
import localization from '../../shared/strings';
import ToolbarSort from '../Sort';
import CatalogViewMode from '../CatalogViewMode';

import Breadcrumbs from '../Breadcrumbs';
import Search from '../Search';
import Button from './Button';
import Group from './Group';
import BrandedLogo from './BrandedLogo';
import ProofingContacts from './ProofingContacts';

const isProofing = picsioConfig.isProofing();
const { websiteConfig } = window;

const {
  blogLinkShow,
  contactsShow,
  emailShow,
  fbLinkShow,
  instagramLinkShow,
  phoneShow,
  logoUrl,
  twitterLinkShow,
  user,
} = websiteConfig;
const permissions = {
  contacts: {
    phone: phoneShow,
    email: emailShow,
    blogUrl: blogLinkShow,
    facebookUrl: fbLinkShow,
    instagramUrl: instagramLinkShow,
    twitterUrl: twitterLinkShow,
  },
};
function ToolbarCatalogProofingTop(props) {
  const {
    downloadListItemsLength,
    downloadListOpened,
    handleDownload,
    handleDownloadList,
    handleToggleTree,
    openedTree,
    selectedItemsLength,
    sortType,
    handleChangeSort,
  } = props;

  const { access } = picsioConfig;

  return (
    <div className="toolbar toolbarCatalogTop">
      <If condition={access.tagsTreeShow}>
        <>
          <Group>
            <Button
              id="button-proofingTree"
              icon={() => <Collections />}
              onClick={handleToggleTree}
              additionalClass={openedTree === 'collections' ? 'active' : null}
            />
          </Group>
          <If condition={logoUrl}>
            <Group>
              <BrandedLogo src={logoUrl} rounded />
            </Group>
          </If>
          <Group additionalClass="wrapperBreadcrumbs">
            <ErrorBoundary>
              <Breadcrumbs />
            </ErrorBoundary>
          </Group>
        </>
      </If>
      <If condition={!access.tagsTreeShow}>
        <>
          <If condition={logoUrl}>
            <Group>
              <BrandedLogo src={logoUrl} rounded />
            </Group>
          </If>
          <Group additionalClass="toolbarGroup-first">
            <span className="proofingTitle">{access.customGalleryTitle}</span>
          </Group>
        </>
      </If>
      <Group>
        <If condition={access.searchShow}>
          <ErrorBoundary>
            <Search
              hide={{
                keywords: isProofing,
                labels: isProofing,
                flags: isProofing && !access.flagShow,
                colors: isProofing && !access.colorShow,
                rating: isProofing && !access.ratingShow,
                btnSaveThisSearch: isProofing,
                customFieldsAdd: isProofing,
              }}
            />
          </ErrorBoundary>
        </If>
        <CatalogViewMode />
        <If condition={(downloadListItemsLength > 0 || downloadListOpened)}>
          <Button
            id="button-downloadList"
            icon={() => <DownloadList />}
            iconSize="xl"
            tooltip={localization.TOOLBARS.titleDownloadDialog}
            tooltipPosition="bottom"
            onClick={handleDownloadList}
            additionalClass={downloadListOpened ? 'active' : null}
            counter={downloadListItemsLength}
          />
        </If>
        <ToolbarSort
          sortType={sortType}
          changeSort={handleChangeSort}
        />
        <If condition={contactsShow}>
          <ProofingContacts user={user} permissions={permissions.contacts} />
        </If>
        <If condition={access.download || (websiteConfig.downloadSingleFile && selectedItemsLength > 1)}>
          <Button
            id="button-proofingDownload"
            icon={() => <Download />}
            tooltip={
              selectedItemsLength > 0
                ? localization.TOOLBARS.titleDownloadSelectedAssets(selectedItemsLength)
                : localization.TOOLBARS.titleDownloadAssetsAsArchive
            }
            tooltipPosition="bottom"
            onClick={handleDownload}
          />
        </If>
      </Group>
    </div>
  );
}

ToolbarCatalogProofingTop.defaultProps = {
  selectedItemsLength: 0,
  downloadListItemsLength: 0,
  downloadListOpened: false,
  openedTree: 'collections',
};

ToolbarCatalogProofingTop.propTypes = {
  downloadListItemsLength: PropTypes.number,
  downloadListOpened: PropTypes.bool,
  handleDownload: PropTypes.func.isRequired,
  handleDownloadList: PropTypes.func.isRequired,
  handleToggleTree: PropTypes.func.isRequired,
  openedTree: PropTypes.string,
  selectedItemsLength: PropTypes.number,
};

export default memo(ToolbarCatalogProofingTop);
