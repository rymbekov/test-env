import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import picsioConfig from '../../../../../config';
import Logger from '../../services/Logger';
import { navigateToRoot } from '../../helpers/history';
import * as mainActions from '../../store/actions/main';
import PlaceholderArchive from './PlaceholderArchive';
import PlaceholderKeywords from './PlaceholderKeywords';
import PlaceholderInboxes from './PlaceholderInboxes';
import PlaceholderLightboards from './PlaceholderLightboards';
import PlaceholderSavedSearches from './PlaceholderSavedSearches';
import PlaceholderOtherFilters from './PlaceholderOtherFilters';
import './placeholderEmpty.scss';

const PlaceholderEmptySearch = () => {
  const dispatch = useDispatch();
  const routerQuery = useSelector((state) => state.router.location.query);
  const { openedTree } = useSelector((state) => state.main);
  const { activeSavedSearch } = useSelector((state) => state.savedSearches);
  const activeCollectionName = useSelector((state) => state.collections?.activeCollection?.name);

  const checkForCustomFields = () => {
    const customField = Object.keys(routerQuery).find((filter) => filter.startsWith('meta'));
    return Boolean(customField);
  };

  const checkForOtherFilters = () => {
    const queryWithCustomFields = checkForCustomFields();
    return queryWithCustomFields
        || routerQuery.text
        || routerQuery.type
        || routerQuery.color
        || routerQuery.createdAt
        || routerQuery.flag
        || routerQuery.rating
        || routerQuery.updatedAt;
  };

  const goToLibrary = () => {
    Logger.log('User', 'GoToLibrary');
    navigateToRoot();
    if (openedTree !== 'collections') {
      dispatch(mainActions.changeTree('collections'));
    }
  };

  return (
    <div className="placeholderEmpty">
      <Choose>
        <When condition={routerQuery.keywords?.length}>
          <PlaceholderKeywords />
        </When>
        <When condition={routerQuery.inboxId}>
          <PlaceholderInboxes goToLibrary={goToLibrary} />
        </When>
        <When condition={routerQuery.lightboardId}>
          <PlaceholderLightboards />
        </When>
        <When condition={activeSavedSearch}>
          <PlaceholderSavedSearches name={activeSavedSearch.name} goToLibrary={goToLibrary} />
        </When>
        <When condition={routerQuery.archived}>
          <PlaceholderArchive />
        </When>
        <When condition={checkForOtherFilters()}>
          <PlaceholderOtherFilters collectionName={activeCollectionName} />
        </When>
        <Otherwise>
          <div className="placeholderEmptyTitle">
            There are no files in collection <span className="act">{activeCollectionName}</span>.<br />
            <If condition={picsioConfig.isMainApp()}>
              Click upward arrow in the toolbar below to upload files.
            </If>
          </div>
        </Otherwise>
      </Choose>
    </div>
  );
};

PlaceholderEmptySearch.defaultProps = {
};

PlaceholderEmptySearch.propTypes = {

};

export default PlaceholderEmptySearch;
