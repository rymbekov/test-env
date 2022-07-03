import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  Grid,
  List,
  Globe,
} from '@picsio/ui/dist/icons';
import localization from '../../shared/strings';
import DropOpener from '../toolbars/DropOpener';
import DropItem from '../DropItem';
import { changeCatalogViewMode, changeCatalogViewItemSize } from '../../store/actions/main';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import picsioConfig from '../../../../../config';

const CatalogViewMode = () => {
  const isProofing = picsioConfig.isProofing();
  const catalogViewMode = useSelector((state) => state.main.catalogViewMode);
  const catalogViewItemSize = useSelector((state) => state.main.catalogViewItemSize);
  const dispatch = useDispatch();

  const handleChangeMode = useCallback((mode) => {
    dispatch(changeCatalogViewMode(mode));
    Logger.log('User', 'ChangeViewMode', utils.capitalizeFirstLetter(mode));
  }, [dispatch]);

  const handleChangeSize = useCallback((mode) => {
    dispatch(changeCatalogViewItemSize(mode));
    Logger.log('User', 'ChangeViewModeSize', mode);
  }, [dispatch]);

  const toogleSize = useCallback(() => {
    if (catalogViewMode !== 'list') handleChangeMode('list');
    if (catalogViewItemSize === 1) {
      handleChangeSize(1.5);
    } else if (catalogViewItemSize === 1.5) {
      handleChangeSize(2);
    } else if (catalogViewItemSize === 2 || !catalogViewItemSize) {
      handleChangeSize(1);
    }
  }, [catalogViewMode, catalogViewItemSize, handleChangeSize, handleChangeMode]);

  const mainIcon = useCallback(() => {
    if (catalogViewMode === 'geo') return <Globe />;
    if (catalogViewMode === 'list') return <List />;
    return <Grid />;
  }, [catalogViewMode]);

  return (
    <DropOpener
      icon={mainIcon}
      id="button-viewMode"
      additionalClass="mobileNotVisible toolbarButtonDropdown"
      name="View type"
      left
    >
      <DropItem
        icon={() => <Grid />}
        id="viewModeGrid"
        text={localization.TOOLBARS.textGrid}
        isActive={catalogViewMode === 'grid'}
        onClick={() => handleChangeMode('grid')}
      />
      <DropItem
        icon={() => <List />}
        id="viewModeList"
        text={localization.TOOLBARS.textList}
        sortViewMode
        isActive={catalogViewMode === 'list'}
        onClick={toogleSize}
        handleChangeCatalogViewItemSize={handleChangeSize}
        handleChangeCatalogViewMode={handleChangeMode}
        catalogViewItemSize={catalogViewItemSize}
        sizeText={localization.TOOLBARS.textListSize}
        catalogViewMode="list"
      />
      <If condition={!isProofing}>
        <DropItem
          icon={() => <Globe />}
          id="viewModeMap"
          text={localization.TOOLBARS.textMap}
          isActive={catalogViewMode === 'geo'}
          onClick={() => handleChangeMode('geo')}
        />
      </If>
    </DropOpener>
  );
};

export default CatalogViewMode;
