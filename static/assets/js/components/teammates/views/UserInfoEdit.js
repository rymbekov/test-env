import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import EditForm from '../../../UIComponents/EditForm';
import { FACEBOOK } from '../../../UIComponents/EditForm/schema/placeholders';

const UserInfoEdit = (props) => {
  const { user, updateUser, updateTeammateByField, isCurrentUser, isManagingTeammateEnabled } = props;
  const { _id: userId } = user;
  const schemaId = isCurrentUser ? 'user' : 'teammate';
  const fields = useMemo(
    () => ({
      user: [
        {
          fieldType: 'textfield',
          id: 'phone',
          label: 'Phone',
          type: 'text',
        },
        {
          fieldType: 'textfield',
          id: 'slackUserId',
          label: 'Slack member ID',
          type: 'text',
        },
        {
          fieldType: 'textfield',
          id: 'facebookUrl',
          label: 'Facebook',
          placeholder: FACEBOOK,
          type: 'text',
        },
        {
          fieldType: 'textfield',
          id: 'about',
          label: 'About',
          type: 'text',
          InputProps: {
            component: 'textarea',
            multiline: true,
            inputProps: {
              rows: 5,
            },
          },
        },
      ],
      teammate: [
        {
          fieldType: 'textfield',
          id: 'displayName',
          label: 'Full name',
          type: 'text',
          disabled: !isManagingTeammateEnabled,
        },
        {
          fieldType: 'textfield',
          id: 'position',
          label: 'Position',
          type: 'text',
          disabled: !isManagingTeammateEnabled,
        },
        {
          fieldType: 'textfield',
          id: 'phone',
          label: 'Phone',
          type: 'text',
          placeholder: '+123456789',
          disabled: !isManagingTeammateEnabled,
        },
        {
          fieldType: 'textfield',
          id: 'slackUserId',
          label: 'Slack member ID',
          type: 'text',
          disabled: !isManagingTeammateEnabled,
        },
      ],
    }),
    [isManagingTeammateEnabled]
  );

  const updateField = useCallback(
    (field, value) => {
      if (isCurrentUser) {
        updateUser({ [field]: value }, false);
      } else {
        updateTeammateByField({ teammateId: userId, field, value });
      }
    },
    [userId, isCurrentUser, updateUser, updateTeammateByField]
  );

  return (
    <div className="pageTeam__user__edit">
      <EditForm
        schemaId={schemaId}
        data={user}
        fields={fields[schemaId]}
        updateField={updateField}
      />
    </div>
  );
};

UserInfoEdit.propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
  updateUser: PropTypes.func.isRequired,
  updateTeammateByField: PropTypes.func.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
  isManagingTeammateEnabled: PropTypes.bool.isRequired,
};

export default UserInfoEdit;
