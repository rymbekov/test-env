/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Icon from '../../../Icon';
import localization from '../../../../shared/strings';
import { removeModifiedField } from '../../../../store/actions/assets';
import picsioConfig from '../../../../../../../config';
import Tooltip from '../../../Tooltip';

import './styles.scss';

const ModifiedField = ({ field }) => {
  if (!picsioConfig.isMainApp()) {
    return null;
  }
  const dispatch = useDispatch();
  const { _id: currentUserId, ignoreLockMetadataFields } = useSelector((state) => state.user);
  const { items: team } = useSelector((state) => state.teammates);
  const { modifiedFields } = useSelector((state) => state.assets.inProgress);
  const [userName, setUserName] = useState('');

  if (ignoreLockMetadataFields) {
    return null;
  }

  useEffect(() => {
    if (field) {
      const teammate = team.find((user) => user._id === field.userId);
      if (currentUserId === field.userId) {
        setUserName(localization.MODIFIED_FIELD.currentUser);
      } else if (teammate) {
        setUserName(teammate.displayName);
      } else {
        setUserName(localization.MODIFIED_FIELD.teammate);
      }
    }
  }, [field]);

  return (
    <Tooltip content={localization.MODIFIED_FIELD.tooltip(userName)} placement="top">
      <div className="modifiedField" onClick={() => dispatch(removeModifiedField(field.name))}>
        <Icon name={modifiedFields.includes(field.name) ? 'sync' : 'editField'} />
      </div>
    </Tooltip>
  );
};

export default ModifiedField;
