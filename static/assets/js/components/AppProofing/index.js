import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import picsioConfig from '../../../../../config';
import ToolbarCatalogProofing from '../toolbars/ToolbarCatalogProofing';
import CollectionsTree from '../collectionsTree';
import CatalogView from '../CatalogView';
import DownloadListComponent from '../DownloadList';

export default function AppProofing(props) {
  const { children } = props;

  return (
    <ErrorBoundary>
      <div className="appMain">
        <div className="content">
          <DownloadListComponent />
          <If condition={picsioConfig.access.tagsTreeShow}>
            <CollectionsTree />
          </If>

          <div className="topleftPicsioToolbar" />
          <div className="toprightPicsioToolbar" />
          <div className="leftPicsioToolbar" />
          <div className="bottomleftPicsioToolbar" />

          <div className="appCatalog">
            <CatalogView />
            <ToolbarCatalogProofing />
          </div>
        </div>
        {children}
      </div>
    </ErrorBoundary>
  );
}
