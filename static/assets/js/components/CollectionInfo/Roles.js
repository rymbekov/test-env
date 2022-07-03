import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from '@picsio/ui';
import CollectionRoles from './CollectionRoles';

const Roles = (props) => {
  const { isOpen, toggleCollapseVisibility, teammates, teamRoles, collectionId } = props;

  return (
    <Collapse
      fontSize="md"
      isOpen={isOpen}
      onClick={() => {
        toggleCollapseVisibility('roles');
      }}
      title="Roles"
      transition
    >
      <div className="PicsioCollapse__content--inner">
        <CollectionRoles teammates={teammates} collectionId={collectionId} roles={teamRoles} />
      </div>
    </Collapse>
  );
};

Roles.defaultProps = {
  isOpen: true,
};

Roles.propTypes = {
  collectionId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  teammates: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      avatar: PropTypes.string,
      displayName: PropTypes.string,
    })
  ).isRequired,
  teamRoles: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      userId: PropTypes.string,
      name: PropTypes.string,
      allowedCollections: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string,
          path: PropTypes.string,
          permissions: PropTypes.objectOf(PropTypes.bool)
        })
      ),
    })
  ).isRequired,
  toggleCollapseVisibility: PropTypes.func.isRequired,
};

export default memo(Roles);
