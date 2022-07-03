import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Tag from '../Tag';
import { normalizeUserAvatarSrc } from '../../store/helpers/teammates';

const CollectionRoles = props => {
  const { collectionId, teammates, roles } = props;

  const rolesWithCollection = [];
  roles.forEach(role => {
    if (role.allowedCollections) {
      const collection = role.allowedCollections.find((allowedCollection) => {
        if (allowedCollection._id === collectionId || allowedCollection.path === '/root') {
          return true;
        }
        return false;
      });
      if (collection) {
        const temmatesWithRoles = [];
        teammates.forEach((teammate) => {
          if (role._id === teammate.roleId) {
            if (teammate.avatarOriginal) {
              temmatesWithRoles.push({...teammate, avatar: normalizeUserAvatarSrc(teammate.avatarOriginal, 'small', true) });
            } else {
              temmatesWithRoles.push({...teammate, });
            }
          }
        });
        if (temmatesWithRoles.length) {

          rolesWithCollection.push({...role, teammates: temmatesWithRoles});
        }
      }
    }
  });

	return (
    <>
      {rolesWithCollection.map((role) => (
        <Choose>
          <When condition={role.teammates.length}>
            <div className="InfoPanel__Row" key={role._id}>
              <span className="InfoPanel__Row--label">{role.name}: </span>
              {role.teammates.map((teammate) => (
                <Tag type="user" key={teammate._id} avatar={teammate.avatar} text={teammate.displayName} />
              ))}
            </div>
          </When>
          <Otherwise>{null}</Otherwise>
        </Choose>
      ))}
    </>
  );
}

CollectionRoles.propTypes = {
  collectionId: PropTypes.string.isRequired,
  teammates: PropTypes.arrayOf(
    PropTypes.shape({
      [PropTypes.string]: PropTypes.string,
    })
  ).isRequired,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      [PropTypes.string]: PropTypes.string,
    })
  ).isRequired,
};

export default memo(CollectionRoles);
