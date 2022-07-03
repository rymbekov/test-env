import React from 'react'; // eslint-disable-line
export default class ScreenSingleSharingHeader extends React.Component {
  render() {
    const { singleSharingSettings, assetName, disabled } = this.props;

    return (
      <div className="sharingSettingsHeader">
        <div className="sharingSettingsAssetName">{assetName}</div>
      </div>
    );
  }
}
