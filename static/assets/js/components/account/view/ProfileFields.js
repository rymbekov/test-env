import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@picsio/ui';

import localization from '../../../shared/strings';

import EditForm from '../../../UIComponents/EditForm';
import {
  WEBSITE,
  FACEBOOK,
  INSTAGRAM,
  TWITTER,
} from '../../../UIComponents/EditForm/schema/placeholders';

const EmailLabel = ({ onClick }) => (
  <>
    <span>Email</span>
    <Button color="primary" onClick={onClick}>
      Reset password
    </Button>
  </>
);

EmailLabel.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const ProfileFields = (props) => {
  const { user, updateUserField, resetPassword } = props;

  const fields = useMemo(
    () => [
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'email',
        label: <EmailLabel onClick={resetPassword} />,
        placeholder: 'example@gmail.com',
        disabled: true,
        LabelProps: {
          style: {
            width: '100%',
            justifyContent: 'space-between',
          },
        },
      },
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'displayName',
        label: localization.ACCOUNT.inputLabelName,
        placeholder: localization.ACCOUNT.inputPlaceholderName,
        disabled: false,
      },
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'position',
        label: localization.ACCOUNT.inputLabelPosition,
        placeholder: localization.ACCOUNT.inputPlaceholderPosition,
        disabled: false,
      },
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'phone',
        label: localization.ACCOUNT.inputLabelPhone,
        placeholder: '+123456789',
        disabled: false,
      },
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'slackUserId',
        label: 'Slack member ID',
        placeholder: '',
        disabled: false,
      },
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'blogUrl',
        label: localization.ACCOUNT.inputLabelBlogURL,
        placeholder: WEBSITE,
        disabled: false,
        defaultAsPlaceholder: true,
      },
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'facebookUrl',
        label: 'Facebook',
        placeholder: FACEBOOK,
        disabled: false,
        defaultAsPlaceholder: true,
      },
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'instagramUrl',
        label: 'Instagram',
        placeholder: INSTAGRAM,
        disabled: false,
        defaultAsPlaceholder: true,
      },
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'twitterUrl',
        label: 'Twitter',
        placeholder: TWITTER,
        disabled: false,
        defaultAsPlaceholder: true,
      },
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'about',
        label: localization.ACCOUNT.inputLabelAbout,
        placeholder: '',
        disabled: false,
        InputProps: {
          component: 'textarea',
          multiline: true,
          inputProps: {
            rows: 5,
            resize: 'vertical',
          },
        },
      },
      {
        fieldType: 'textfield',
        type: 'text',
        id: 'contacts',
        label: localization.ACCOUNT.inputLabelContacts,
        placeholder: '',
        disabled: false,
        InputProps: {
          component: 'textarea',
          multiline: true,
          inputProps: {
            rows: 5,
            resize: 'vertical',
          },
        },
      },
    ],
    [resetPassword]
  );

  return (
    <div className="profileFields">
      <EditForm schemaId="profile" data={user} fields={fields} updateField={updateUserField} />
    </div>
  );
};

ProfileFields.propTypes = {
  user: PropTypes.objectOf(PropTypes.any).isRequired,
  updateUserField: PropTypes.func.isRequired,
  resetPassword: PropTypes.func.isRequired,
};

export default ProfileFields;
