import React from 'react';

import { ImagePicker } from '../../../UIComponents';
import Logger from '../../../services/Logger';
import localization from '../../../shared/strings';

import ProfileFields from './ProfileFields';

const AVATAR_SIZE_LIMIT = 1024 * 1024;

export default class Profile extends React.Component {
  state = {
    isAvatarInProgress: false,
  };

  updateUserField = (name, value) => {
    const {
      userActions: { updateUser },
    } = this.props;
    const body = { [name]: value };

    updateUser(body, false);
    Logger.log('User', 'SettingsMyAccountChange', { fieldName: name });
  };

  resetPassword = () => {
    const {
      user: { email },
      userActions: { requestResetPassword },
    } = this.props;

    requestResetPassword(email);
  };

  uploadAvatar = async file => {
    Logger.log('User', 'MainSettingsAccountAvatarChange');

    this.setState({ isAvatarInProgress: true });
    await this.props.userActions.uploadAvatar(file);
    this.setState({ isAvatarInProgress: false });
  };

  deleteAvatar = async () => {
    Logger.log('User', 'MainSettingsAccountAvatarDelete');

    this.setState({ isAvatarInProgress: true });
    await this.props.userActions.deleteAvatar();
    this.setState({ isAvatarInProgress: false });
  };

  render() {
    const { isAvatarInProgress } = this.state;
    const { user } = this.props;
    const { avatar } = user;

    return (
      <div className="pageTabsContentAccount">
        <div className="pageContainer">
          <div className="pageItemTitle">{localization.ACCOUNT.titleProfile}</div>
          <div className="profile">
            <div className="profilePhoto">
              <ImagePicker
                btnText={localization.ACCOUNT.inputPhotoButtonText}
                title="Your photo"
                description={localization.ACCOUNT.inputPhotoDescription}
                icon="avatar"
                accept="image/jpg,image/jpeg,image/png,image/gif"
                value={avatar}
                onChange={this.uploadAvatar}
                onRemove={this.deleteAvatar}
                showSpinner={isAvatarInProgress}
                maxFileSize={AVATAR_SIZE_LIMIT}
              />
            </div>
            <ProfileFields user={user} updateUserField={this.updateUserField} resetPassword={this.resetPassword} />
          </div>
        </div>
      </div>
    );
  }
}
