import React, { useState, useRef, useEffect, memo } from 'react'; // eslint-disable-line
import pluralize from 'pluralize';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { Button } from '@picsio/ui';
import ErrorBoundary from '../ErrorBoundary';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';
import Icon from '../Icon';
import Name from './Name';
import Description from './Description';
import MainInfo from './MainInfo';
import Colors from './Colors';
import Roles from './Roles';
import Website from './Website';
import { downloadCollection } from '../../helpers/fileDownloader';
import moveCollection from '../../helpers/moveCollection';
import { selectAll } from '../../store/actions/assets';
import {
  changeCollectionColor,
  changeCollectionDescription,
  renameCollection,
  removeCollection,
  addToFavorites,
} from '../../store/actions/collections';
import CollectionMenu from './CollectionMenu';
import { navigate, setSearchRoute } from '../../helpers/history';
import { activeCollectionSelector } from '../../store/selectors/collections';

const getCollectionPanelVisibility = () => {
  try {
    return JSON.parse(utils.LocalStorage.get('picsio.collectionPanelVisibility')) || {};
  } catch (err) {
    return {};
  }
};

const assetsSelector = (state) => state.assets;
const getTotal = createSelector([assetsSelector], (assets) => assets.total);

const CollectionInfo = () => {
  const dispatch = useDispatch();
  const nameRef = useRef(null);
  const { permissions: rolePermissions } = useSelector((state) => state.user.role);
  const { featureFlags } = useSelector((state) => state.user.team);
  const { websites: websitesAllowed, csvImport } = useSelector((state) => state.user.subscriptionFeatures);
  const { items: teamRoles } = useSelector((state) => state.roles);
  const { items: teammates } = useSelector((state) => state.teammates);
  const [collectionPanelVisibility, setSollectionPanelVisibility] = useState(
    getCollectionPanelVisibility(),
  );

  const total = useSelector(getTotal);
  const collection = useSelector((state) => activeCollectionSelector(state));
  const isEditCollectionAllowed = !collection?.archived
    ? collection?.permissions?.editCollections : false;

  const handleUpload = () => {
    setSearchRoute({ tagId: collection._id });
  };

  const handleDownload = () => {
    const { _id: collectionId } = collection;
    Logger.log('User', 'CollectionInfoDownload', { collectionId });
    downloadCollection(collectionId, rolePermissions);
  };

  const handleDelete = () => {
    dispatch(removeCollection(collection));
  };

  const handleRename = () => {
    nameRef.current.initCollectionRenaming();
  };

  const handleWebsite = () => {
    const { _id: collectionId } = collection;
    Logger.log('User', 'CollectionInfoWebsiteSettings', { collectionId });
    navigate(`/websites/${collectionId}?tab=main`);
  };

  const handleFavorite = () => {
    const {
      _id, name, path, favorites,
    } = collection;
    dispatch(addToFavorites(_id, name, path, !favorites));
  };

  const handleMove = () => {
    Logger.log('UI', 'CollectionInfoMove');
    moveCollection(collection);
  };

  const toggleCollapseVisibility = (title) => {
    const newCollectionPanelVisibility = { ...collectionPanelVisibility };
    if (newCollectionPanelVisibility[title] === undefined) {
      newCollectionPanelVisibility[title] = false;
    } else {
      newCollectionPanelVisibility[title] = !newCollectionPanelVisibility[title];
    }
    utils.LocalStorage.set(
      'picsio.collectionPanelVisibility',
      JSON.stringify(newCollectionPanelVisibility),
    );
    setSollectionPanelVisibility(newCollectionPanelVisibility);
  };

  const setColor = (color) => {
    let newColor = color.hex;
    if (newColor === collection.color) {
      newColor = 'nocolor';
    }
    Logger.log('User', 'CollectionInfoCollectionColor', {
      collectionId: collection._id,
      color: newColor,
    });
    dispatch(changeCollectionColor(collection._id, newColor));
  };

  const onChangeUpload = (files) => {
    window.dispatchEvent(new CustomEvent('importPanel:add', { detail: files }));
    Logger.log('User', 'CollectionInfoUpload', { collectionId: collection._id });
  };

  return (
    <Choose>
      <When condition={collection}>
        <div className="InfoPanel">
          <div className="InfoPanelHeader" data-qa="InfoPanel-header">
            <header className="InfoPanelHeader__top">
              <Name
                ref={nameRef}
                collection={collection}
                renameCollection={renameCollection}
                isEditCollectionAllowed={isEditCollectionAllowed}
              />
              <If condition={!collection.archived}>
                <div className="InfoPanelHeader__btns">
                  <CollectionMenu
                    collection={collection}
                    canUploadCsv={rolePermissions.importCSV && featureFlags.importCSV && csvImport}
                    websitesAllowed={websitesAllowed}
                    handleUpload={handleUpload}
                    handleDownload={handleDownload}
                    handleDelete={handleDelete}
                    handleRename={handleRename}
                    handleWebsite={handleWebsite}
                    handleFavorite={handleFavorite}
                    handleMove={handleMove}
                    onChangeUpload={onChangeUpload}
                  />
                </div>
              </If>
            </header>
            <div className="InfoPanelAssets">
              <Choose>
                <When condition={total}>
                  <div className="InfoPanelAssets__buttons">
                    <Button
                      id="button-selectAll"
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        dispatch(selectAll());
                        Logger.log('User', 'CollectionInfoSelectAll');
                      }}
                      size="md"
                      fullWidth
                    >
                      {`${localization.DETAILS.textSelectedAll}
                          ${utils.formatNumberWithSpaces(total)}
                          ${pluralize('asset', total, false)}`}
                    </Button>
                  </div>
                </When>
                <Otherwise>
                  <div className="InfoPanelAssets__placeholder">
                    {localization.DETAILS.textNoAssets}
                  </div>
                </Otherwise>
              </Choose>
            </div>
          </div>

          <div className="InfoPanelBody">
            <ErrorBoundary>
              <Description
                isOpen={collectionPanelVisibility.description}
                toggleCollapseVisibility={toggleCollapseVisibility}
                isEditCollectionAllowed={isEditCollectionAllowed}
                changeCollectionDescription={changeCollectionDescription}
                collection={collection}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <MainInfo
                isOpen={collectionPanelVisibility.maininfo}
                toggleCollapseVisibility={toggleCollapseVisibility}
                collection={collection}
                teammates={teammates}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <Roles
                isOpen={collectionPanelVisibility.roles}
                toggleCollapseVisibility={toggleCollapseVisibility}
                collectionId={collection._id}
                teammates={teammates}
                teamRoles={teamRoles}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <If condition={isEditCollectionAllowed}>
                <Colors
                  isOpen={collectionPanelVisibility.color}
                  toggleCollapseVisibility={toggleCollapseVisibility}
                  isBusy={collection.isBusy}
                  color={collection.color}
                  setColor={setColor}
                />
              </If>
            </ErrorBoundary>
            <ErrorBoundary>
              <If condition={collection.website}>
                <Website
                  isOpen={collectionPanelVisibility.website}
                  toggleCollapseVisibility={toggleCollapseVisibility}
                  website={collection.website}
                />
              </If>
            </ErrorBoundary>
          </div>
        </div>
      </When>
      {/* Inboxes, Lightboards */}
      <Otherwise>
        <div className="detailsPanel__empty">
          <Icon name="info" />
          <div className="txtNoImageSelected">
            {localization.DETAILS.textNoFiles} {`${total ? 'selected' : ''}`}
          </div>
          <If condition={total}>
            <div className="btnsSelection">
              <Button
                id="button-selectAll"
                variant="contained"
                color="secondary"
                onClick={() => {
                  dispatch(selectAll());
                  Logger.log('User', 'InfoPanelSelectAll');
                }}
                size="md"
                fullWidth
              >
                {localization.DETAILS.textSelectedAll}
              </Button>
            </div>
          </If>
        </div>
      </Otherwise>
    </Choose>
  );
};

export default memo(CollectionInfo);
