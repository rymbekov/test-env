import React, { useCallback, memo } from 'react'; // eslint-disable-line
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Dropdown from '../dropdown';
import { setSearchRoute } from '../../helpers/history';

import './style.scss';

const RoleDropdown = (props) => {
  const {
    isAllowClickItem,
  } = props;
  const rootCollectionId = useSelector((state) => state.collections.collections?.my?._id);

  const users = useSelector((state) => {
    const teammates = state.teammates.items;
    if (!teammates) return [];

    const confirmedUsers = teammates.filter((user) => user.parent?.confirmed);
    return confirmedUsers.map((user) => ({
      _id: user._id,
      title: user.displayName,
      descr: user.email,
      url: user.avatar,
    }));
  });

  const handleClickItem = useCallback((userId) => {
    const user = users.find(({ _id }) => _id === userId);
    const userEmail = user.descr;

    setSearchRoute({ tagId: rootCollectionId, text: `assignees.email:${userEmail}` });
  }, [users, rootCollectionId]);

  return (
    <div className="teammateRole">
      <Dropdown
        type="user"
        onItemClickHandler={isAllowClickItem && handleClickItem}
        createHandler={null}
        {...props}
        isClose
        isRole
        items={users}
      />
    </div>
  );
};

/** @TODO: need propTypes here */

RoleDropdown.propTypes = {
  isAllowClickItem: PropTypes.func,
};

export default memo(RoleDropdown);
