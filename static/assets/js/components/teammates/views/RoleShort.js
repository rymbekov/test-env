/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import RoleDetailed from '../../RoleDetailed';
import CreateButton from './CreateButton';

const RoleShort = (props) => {
  const {
    role,
    actRoleId,
    selectRole,
    removeRole,
    renameRole,
    duplicateRole,
    dropdownCollections,
    isLoading,
    actCollectionId,
    actCollectionIds,
    roles,
    teammates,
    isAllowedRootCollection,
    changeRolePermission,
    isAllowPermission,
    handleToggleCollection,
    handleDetachCollection,
    onClickCollection,
    handleLoadChildren,
    isFetching,
    fetchingId,
    rolesLimit,
    storageType,
  } = props;

  return (
    <div>
      <CreateButton
        item={role}
        actItemId={actRoleId}
        selectItem={selectRole}
        removeItem={removeRole}
        renameItem={renameRole}
        duplicateItem={duplicateRole}
      />
      <div className="pageTeam__leftSidebar__role__mobileblock">
        {<If condition={role._id === actRoleId}>
          <RoleDetailed
            dropdownCollections={dropdownCollections}
            actRole={role}
            actCollectionId={actCollectionId}
            activeCollectionIds={actCollectionIds}
            isLoading={isLoading}
            roles={roles}
            teammates={teammates}
            changeRolePermission={changeRolePermission}
            isAllowPermission={isAllowPermission}
            isAllowedRootCollection={isAllowedRootCollection}
            handleToggleCollection={handleToggleCollection}
            handleDetachCollection={handleDetachCollection}
            onClickCollection={onClickCollection}
            handleLoadChildren={handleLoadChildren}
            isFetching={isFetching}
            fetchingId={fetchingId}
            storageType={storageType}
          />
        </If>}
      </div>
    </div>
  );
};

RoleShort.defaultProps = {
  duplicateRole: null,
};

RoleShort.propTypes = {
  actRoleId: PropTypes.string.isRequired,
  selectRole: PropTypes.func.isRequired,
  removeRole: PropTypes.func.isRequired,
  renameRole: PropTypes.func.isRequired,
  duplicateRole: PropTypes.func.isRequired,
  rolesLimit: PropTypes.number.isRequired,
  storageType: PropTypes.string.isRequired,
};

export default memo(RoleShort);
