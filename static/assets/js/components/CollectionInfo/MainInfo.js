import React, { memo } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Collapse } from '@picsio/ui';
import styled from 'styled-components';
import Tag from '../Tag';
import { normalizeUserAvatarSrc } from '../../store/helpers/teammates';

const MainInfo = (props) => {
  const {
    isOpen, toggleCollapseVisibility, teammates, collection,
  } = props;
  const { createdBy, createdAt, updatedAt } = collection;
  // teammate can be deleted, so we can't find info about this user
  const isCreatorTeammate = teammates.find((teammate) => teammate._id === createdBy);

  return (
    <Collapse
      fontSize="md"
      isOpen={isOpen}
      onClick={() => {
        toggleCollapseVisibility('maininfo');
      }}
      title="Main info"
      transition
    >
      <div className="PicsioCollapse__content--inner">
        <If condition={createdBy && isCreatorTeammate}>
          <div className="InfoPanel__Row">
            <span className="InfoPanel__Row--label">Created by:</span>
            <StyledTag
              type="user"
              avatar={normalizeUserAvatarSrc(
                teammates.find((user) => user._id === createdBy).avatarOriginal,
                'small',
                true,
              )}
              text={teammates.find((user) => user._id === createdBy).displayName}
            />
          </div>
        </If>
        <div className="InfoPanel__Row">
          <span className="InfoPanel__Row--label">Created at:</span>
          {dayjs(createdAt).format('ll')}
        </div>
        <div className="InfoPanel__Row">
          <span className="InfoPanel__Row--label">Updated at:</span>
          {dayjs(updatedAt).format('ll')}
        </div>
      </div>
    </Collapse>
  );
};

MainInfo.defaultProps = {
  isOpen: true,
};

MainInfo.propTypes = {
  isOpen: PropTypes.bool,
  teammates: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      avatar: PropTypes.string,
      displayName: PropTypes.string,
    }),
  ).isRequired,
  collection: PropTypes.shape({
    createdBy: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  toggleCollapseVisibility: PropTypes.func.isRequired,
};

export default memo(MainInfo);

const StyledTag = styled(Tag)`
  margin: 0;
`;
