import React from 'react';
import {
  array, arrayOf, string, func,
} from 'prop-types';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import AssigneesDropdown from '../../assigneesDropdown';

class UserAssign extends React.Component {
  assignUser = (user) => {
    this.props.assign(user._id, this.props.selectedAssetsIds);
    Logger.log('User', 'InfoPanelChangeAssignees', {
      userId: user._id,
      selectedAssetsIds: this.props.selectedAssetsIds,
      value: true,
    });
  };

  unAssignUser = (user) => {
    this.props.unAssign(user._id, this.props.selectedAssetsIds);
    Logger.log('User', 'InfoPanelChangeAssignees', {
      userId: user._id,
      selectedAssetsIds: this.props.selectedAssetsIds,
      value: false,
    });
  };

  render() {
    return (
      <AssigneesDropdown
        title={localization.ASSING_USER.title}
        placeholder={localization.ASSING_USER.placeholder}
        placeholderIcon="emptyAvatar"
        icon="avatar"
        filterText={localization.ASSING_USER.filterText}
        checkedItems={this.props.assignees}
        onCheckedHandler={this.assignUser}
        onUncheckedHandler={this.unAssignUser}
        createHandler={null}
        highlight={this.props.highlight}
        highlightAnimationReset={this.props.highlightAnimationReset}
        highlightAnimationResetName="assign"
        readOnly={this.props.readOnly}
        isAllowClickItem
        inProgress={this.props.inProgress}
      />
    );
  }
}

UserAssign.propTypes = {
  assignees: array,
  assign: func,
  unAssign: func,
  selectedAssetsIds: arrayOf(string),
  highlight: array,
  highlightAnimationReset: func,
};

export default UserAssign;
