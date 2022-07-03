import React, { useState, useEffect } from 'react';
import { usePrevious } from 'react-use';
import { useSelector, useDispatch } from 'react-redux';
import {
  Audit,
  User,
  Dollar,
  Sync,
  List,
  Grid,
  Globe,
  Storage,
  QuestionTransparent,
  WhatsNew,
  MyTeam,
  Referal,
  Logout,
  SortAz,
} from '@picsio/ui/dist/icons';
import { changeCatalogViewMode, setMobileAdditionalScreenPanel } from '../../store/actions/main';
import { isHaveTeammatePermission } from '../../store/helpers/user';

import { updateSortType } from '../../store/actions/lightboards';
import * as UtilsCollections from '../../store/utils/collections';

import localization from '../../shared/strings';
import ua from '../../ua';
import Logger from '../../services/Logger';
import ToolbarSort from '../Sort';
import DropItem from '../DropItem';
import DropOpener from './DropOpener';
import GiftBox from './giftBox.svg';
import { isRouteSearch } from '../../helpers/history';

export default function SettingsMenu() {
  const dispatch = useDispatch();
  const { isSyncAllowed } = useSelector((state) => state.user);
  const { catalogViewMode } = useSelector((state) => state.main);
  const { sortType: collectionsSortType } = useSelector((state) => state.collections.activeCollection || {});
  const { sortType: lightboardsSortType } = useSelector((state) => state.lightboards.activeLightboard || {});
  const { query: searchQuery } = useSelector((state) => state.router.location);
  const prevSearchQuery = usePrevious(searchQuery);

  const [viewModeIsOpen, setViewMode] = useState(false);
  const [sortModeIsOpen, setSortMode] = useState(false);
  const [sortType, setSortType] = useState({ type: 'uploadTime', order: 'desc' });

  useEffect(() => {
    const getCurrentSortType = () => {
      let newSortType = { ...sortType };

      if (searchQuery.tagId && collectionsSortType) {
        newSortType = collectionsSortType;
      } else if (searchQuery.lightboardId && lightboardsSortType) {
        newSortType = lightboardsSortType;
      }

      return newSortType;
    };

    const changeSortType = () => {
      const newSortType = getCurrentSortType();
      if (newSortType !== sortType) {
        setSortType(newSortType);
      }
    };

    if (isRouteSearch() && prevSearchQuery !== searchQuery) {
      changeSortType();
    }
  }, [sortType, collectionsSortType, lightboardsSortType, prevSearchQuery, searchQuery]);

  const handleChangeSort = (name, order) => {
    if (searchQuery.tagId) {
      UtilsCollections.setSortType({
        type: name,
        order,
      });
    }

    if (searchQuery.lightboardId) {
      dispatch(
        updateSortType(searchQuery.lightboardId, {
          type: name,
          order,
        })
      );
    }

    dispatch(setMobileAdditionalScreenPanel('Home'));
  };

  const resetDropdowns = () => {
    setSortMode(false);
    setViewMode(false);
  };

  const whatsNew = () => {
    Logger.log('User', 'SettingsWhatsNew');
    window.open('https://blog.pics.io/', '_blank');
  };
  return (
    <div className="settingMenu">
      <DropItem
        icon={() => <User />}
        text={localization.TOOLBARS.textMyAccount}
        href="/users/me?tab=account"
      />
      {isSyncAllowed && (
        <DropItem
          icon={() => <Sync />}
          text={localization.TOOLBARS.textSync}
          href="/sync"
        />
      )}
      {isHaveTeammatePermission('manageBilling') && !ua.isMobileApp() && (
        <DropItem
          icon={() => <Dollar />}
          text={localization.TOOLBARS.textBilling}
          href="/billing?tab=overview"
        />
        )}
      {isHaveTeammatePermission('manageStorage') && (
        <DropItem
          icon={() => <Storage />}
          text={localization.TOOLBARS.textStorage}
          href="/storage"
        />
      )}
      {isHaveTeammatePermission('editCustomFieldsSchema') && (
        <DropItem
          icon="customFields"
          text={localization.TOOLBARS.textCustomFields}
          href="/customfields"
        />
      )}
      <DropItem
        icon={() => <MyTeam />}
        text={localization.TOOLBARS.textMyTeam}
        href="/teammates?tab=settings"
      />
      <DropItem
        icon={() => <Audit />}
        text={localization.TOOLBARS.textAuditTrail}
        href={isHaveTeammatePermission('accessAuditTrail')
        ? '/audit?tab=audit'
        : '/audit?tab=analytics'}
      />
      <DropItem
        icon={() => <Referal />}
        text={localization.TOOLBARS.textReferralProgram}
        href="/referral"
      >
        <GiftBox className="giftBox" />
      </DropItem>
      <div className="toolbarDropdownSeparator" />

      <DropItem
        icon={catalogViewMode === 'grid' ? () => <Grid /> : () => <List />}
        text="View Mode"
        onClick={() => {
          setViewMode(true);
        }}
      />
      <DropItem
        icon={() => <SortAz />}
        text="Sort Mode"
        onClick={() => {
          setSortMode(true);
        }}
      />
      <DropItem
        icon={() => <QuestionTransparent />}
        text={localization.TOOLBARS.textTutorials}
        onClick={() => {
          window.dispatchEvent(new Event('toolbar:ui:tutorials'));
        }}
      />
      <DropItem
        icon={() => <WhatsNew />}
        text={localization.TOOLBARS.textWhatsNew}
        onClick={() => {
          whatsNew();
        }}
      />
      <DropItem
        icon={() => <Logout />}
        text={localization.TOOLBARS.textLogOut}
        onClick={() => {
          window.dispatchEvent(new Event('toolbar:ui:logout'));
        }}
      />
      <ToolbarSort
        sortType={sortType}
        changeSort={handleChangeSort}
        resetDropdowns={resetDropdowns}
        isToolbarDropdownOpened={sortModeIsOpen}
      />

      <DropOpener
        icon={
          catalogViewMode === 'grid'
            ? () => <Grid />
            : catalogViewMode === 'list'
              ? () => <List />
              : () => <Globe />
        }
        additionalClass="tabletNotVisible toolbarButtonDropdown"
        name="View type"
        isToolbarDropdownOpened={viewModeIsOpen}
        resetDropdowns={resetDropdowns}
        right
      >
        <DropItem
          icon={() => <Grid />}
          text={localization.TOOLBARS.textGrid}
          isActive={catalogViewMode === 'grid'}
          onClick={() => {
            dispatch(changeCatalogViewMode('grid'));
            dispatch(setMobileAdditionalScreenPanel('Home'));
            Logger.log('User', 'ChangeViewMode', 'Grid');
          }}
        />
        <DropItem
          icon={() => <List />}
          text={localization.TOOLBARS.textList}
          isActive={catalogViewMode === 'list'}
          onClick={() => {
            dispatch(changeCatalogViewMode('list'));
            dispatch(setMobileAdditionalScreenPanel('Home'));
            Logger.log('User', 'ChangeViewMode', 'List');
          }}
        />
        <DropItem
          icon={() => <Globe />}
          text={localization.TOOLBARS.textMap}
          isActive={catalogViewMode === 'geo'}
          onClick={() => {
            dispatch(changeCatalogViewMode('geo'));
            dispatch(setMobileAdditionalScreenPanel('Home'));
            Logger.log('User', 'ChangeViewMode', 'Geo');
          }}
        />
      </DropOpener>
    </div>
  );
}
