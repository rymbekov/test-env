import React, {
  memo, useCallback, useMemo, useState,
} from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import { Checkbox } from '../../UIComponents';
import './style.scss';

const RolePermission = (props) => {
  const {
    actRole,
    permission,
    actCollectionIds,
    isAllowedRootCollection,
    changeRolePermission,
    isAllowPermission,
    storageType,
    mergedCollectionsPermissions,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const isCollectionPermission = actCollectionIds?.length;
  const listPermissions = !isCollectionPermission
    ? actRole.permissions
    : mergedCollectionsPermissions;

  const isSyncAndDisallowedRootCollections = permission.name === 'sync' && !isAllowedRootCollection;
  const isEditAssetKeywordsDisabled = permission.name === 'autogenerateKeywords' && !listPermissions.editAssetKeywords;
  const isPermissionDisabled = isSyncAndDisallowedRootCollections || isEditAssetKeywordsDisabled;
  const isPermissionAllowed = isAllowPermission(permission);

  const getPermissionValues = useCallback((item) => {
    if (!item.children) return [listPermissions[item.name]];
    return item.children.map(getPermissionValues);
  }, [listPermissions]);

  const value = useMemo(() => {
    const values = getPermissionValues(permission).flat(Infinity);
    if (values.every((v) => v === true)) return true;
    if (values.some(Boolean)) return 'indeterminate';
    return false;
  }, [getPermissionValues, permission]);

  const handleChangeRolePermission = useCallback((val) => {
    changeRolePermission(permission, val, actRole, {
      actCollectionIds,
      mergedValue: value,
    });
  }, [value, actCollectionIds, permission, actRole, changeRolePermission]);

  if (isPermissionAllowed) {
    return (
      <>
        <div className="permissionBlock">
          <div
            className="pageTeam__role__permission"
          >
            <If condition={permission.children?.length}>
              <span
                className={cn('permission__arrow', { active: isOpen })}
                onClick={() => setIsOpen(!isOpen)}
              />
            </If>
            <div className="pageTeam__role__checkbox">
              <Checkbox
                label={
                  typeof permission.title === 'function'
                    ? permission.title({ isSyncAndDisallowedRootCollections, storageType })
                    : permission.title
                }
                onChange={handleChangeRolePermission}
                value={value}
                disabled={isPermissionDisabled}
              />
            </div>
          </div>
          <If condition={permission.description}>
            <span className="permissionDescription">{permission.description}</span>
          </If>
        </div>
        <CSSTransition in={isOpen} timeout={300} classNames="fade">
          <>
            <If condition={permission.children?.length && isOpen}>
              <div className="rolePermissionChildren">
                {permission.children.map(
                  (child) => <RolePermission {...props} permission={child} key={child.name} />
                )}
              </div>
            </If>
          </>
        </CSSTransition>

      </>
    );
  }
  return null;
};

RolePermission.defaultProps = {
  actCollectionIds: [],
  mergedCollectionsPermissions: null,
};

RolePermission.propTypes = {
  actRole: PropTypes.shape({
    _id: PropTypes.string,
    allowedCollections: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        path: PropTypes.string,
        permissions: PropTypes.objectOf(PropTypes.bool),
      }),
    ),
    name: PropTypes.string,
    userId: PropTypes.string,
    permissions: PropTypes.objectOf(PropTypes.bool),
  }).isRequired,
  permission: PropTypes.shape({
    description: PropTypes.string,
    name: PropTypes.string,
    children: PropTypes.arr,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  }).isRequired,
  actCollectionIds: PropTypes.arrayOf(PropTypes.string),
  mergedCollectionsPermissions: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  ),
  isAllowedRootCollection: PropTypes.bool.isRequired,
  changeRolePermission: PropTypes.func.isRequired,
  isAllowPermission: PropTypes.func.isRequired,
  storageType: PropTypes.string.isRequired,
};

export default memo(RolePermission);
