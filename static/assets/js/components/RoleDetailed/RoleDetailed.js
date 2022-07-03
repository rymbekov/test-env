/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import cn from 'classnames';
import { useSelector } from 'react-redux';
import localization from '../../shared/strings';
import { findCollection } from '../../store/helpers/collections';
import Icon from '../Icon';
import CollectionsList from '../CollectionsList';
import Logger from '../../services/Logger';
import UsersWithRole from '../teammates/views/UsersWithRole';
import RolePermission from '../RolePermission';
import ROLE_PERMISSIONS from '../teammates/configs/rolePermissions';
import COLLECTION_PERMISSIONS, { DEFAULT_PERMISSIONS } from '../teammates/configs/collectionPermissions';

import './style.scss';

const RoleDetailed = (props) => {
  const {
    isLoading,
    actCollectionId,
    actCollectionIds,
    actRole,
    roles,
    teammates,
    isAllowedRootCollection,
    changeRolePermission,
    isAllowPermission,
    handleToggleCollection,
    handleDetachCollection,
    onClickCollection,
    onClickSelectedAllCollection,
    handleLoadChildren,
    isFetching,
    fetchingId,
    storageType,
  } = props;

  const [activeTab, isActiveTab] = useState(localization.TEAMMATES.textPermissions);

  const activePermission = activeTab === localization.TEAMMATES.textPermissions;
  const activeCollection = activeTab === localization.TEAMMATES.textTeamCollections;

  const componentMyTeamRoles = 'myTeam_roles';
  const urlAssigningRolesToTeammates = localization.HELP_CENTER[componentMyTeamRoles].url;

  const collections = useSelector((state) => state.collections.collections);
  const rootCollection = findCollection(collections, null, {
    path: 'root',
  });

  let selectedAllowedCollections;
  let allSelectedCollectionsPermissions;
  const mergedCollectionsPermissions = {};
  if (actCollectionIds?.length) {
    selectedAllowedCollections = actRole.allowedCollections.filter(
      (collection) => actCollectionIds.includes(collection._id),
    );
    allSelectedCollectionsPermissions = selectedAllowedCollections.map((c) => c.permissions);
    Object.keys(DEFAULT_PERMISSIONS).forEach((key) => {
      if (allSelectedCollectionsPermissions.every((i) => i[key] === true)) {
        mergedCollectionsPermissions[key] = true;
      } else if (allSelectedCollectionsPermissions.some((i) => i[key])) {
        mergedCollectionsPermissions[key] = 'indeterminate';
      } else {
        mergedCollectionsPermissions[key] = false;
      }
    });
  }
  return (
    <div className="pageTeam__role__inner">
      <UsersWithRole actRoleId={actRole._id} roles={roles} teammates={teammates} />
      <div className="tabRole">
        <div className={cn('tabRole-item', { act: activePermission })} onClick={() => isActiveTab(localization.TEAMMATES.textPermissions)}>{localization.TEAMMATES.textPermissions}</div>
        <div className={cn('tabRole-item', { act: activeCollection })} onClick={() => isActiveTab(localization.TEAMMATES.textTeamCollections)}>{localization.TEAMMATES.textTeamCollections}</div>
      </div>
      <CSSTransition in={activePermission} timeout={300} classNames="fade">
        <>
          <If condition={activePermission}>
            <div className="roleDetailedItem">
              {ROLE_PERMISSIONS.map((permission) => (
                <RolePermission
                  key={permission.title}
                  permission={permission}
                  actRole={actRole}
                  changeRolePermission={changeRolePermission}
                  isAllowPermission={isAllowPermission}
                  isAllowedRootCollection={isAllowedRootCollection}
                  storageType={storageType}
                />
              ))}
            </div>
          </If>
        </>
      </CSSTransition>
      <CSSTransition in={activeCollection} timeout={300} classNames="fade">
        <>
          <If condition={activeCollection}>
            <div className="roleDetailedItem">
              <CollectionsList
                rootRemovable
                useStore={false}
                allCollections={[rootCollection]}
                selectedCollections={actRole.allowedCollections}
                activeCollectionIds={actCollectionIds}
                handleToggleCollection={handleToggleCollection}
                handleDetachCollection={handleDetachCollection}
                handleClickCollection={onClickCollection}
                handleClickSelectedAllCollection={onClickSelectedAllCollection}
                handleLoadChildren={handleLoadChildren}
                iconSpecial="folder"
                isFetching={isFetching}
                fetchingId={fetchingId}
                placeholderForEmptyCollections={localization.TEAMMATES.textPressPaperclip}
                isLoading={isLoading}
                isSelectAllCollections
              />
              <div className="roleDetailedItem-note">
                {localization.TEAMMATES.textNoteAllowedCollectionsSelect()}
                <span
                  className="helpLink"
                  onClick={() => {
                    window.open(`https://help.pics.io/${urlAssigningRolesToTeammates}`, '_blank');
                    Logger.log('User', 'Help', componentMyTeamRoles);
                  }}
                >
                  {localization.TEAMMATES.learnMoreAboutAllowedCollection}
                  <Icon name="question" />
                </span>
              </div>

              {actCollectionId
          && COLLECTION_PERMISSIONS.map((permission) => (
            <RolePermission
              key={permission.title}
              permission={permission}
              actRole={actRole}
              actCollectionIds={actCollectionIds}
              changeRolePermission={changeRolePermission}
              isAllowPermission={isAllowPermission}
              isAllowedRootCollection={isAllowedRootCollection}
              storageType={storageType}
              mergedCollectionsPermissions={mergedCollectionsPermissions}
            />
          ))}
            </div>
          </If>
        </>
      </CSSTransition>
    </div>
  );
};

RoleDetailed.defaultProps = {
  actCollectionId: null,
  actCollectionIds: [],
};

RoleDetailed.propTypes = {
  actCollectionId: PropTypes.string,
  actCollectionIds: PropTypes.arrayOf(PropTypes.string),
  isLoading: PropTypes.bool,
  roles: PropTypes.array,
  actRole: PropTypes.object,
  teammates: PropTypes.array,
  isAllowedRootCollection: PropTypes.bool,
  changeRolePermission: PropTypes.func,
  isAllowPermission: PropTypes.func,
  handleToggleCollection: PropTypes.func,
  handleDetachCollection: PropTypes.func,
  onClickCollection: PropTypes.func,
  onClickSelectedAllCollection: PropTypes.func,
  handleLoadChildren: PropTypes.func,
  isFetching: PropTypes.bool,
  fetchingId: PropTypes.string,
  storageType: PropTypes.string,
};

export default memo(RoleDetailed);
