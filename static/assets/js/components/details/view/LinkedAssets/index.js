import React from 'react';
import { arrayOf, bool, string } from 'prop-types';
import cn from 'classnames';
import { Button } from '@picsio/ui';
import * as Api from '../../../../api/assets';
import localization from '../../../../shared/strings';
import Logger from '../../../../services/Logger';
import * as utils from '../../../../shared/utils';
import Toast from '../../../Toast';
import Group from './Group';
import SkeletonItem from './SkeletonItem';
import { navigate } from '../../../../helpers/history';

const handleError = (error) => {
  console.error(error);
  const errorStatus = utils.getStatusFromResponceError(error);
  const errorMessage = errorStatus === 403 ? localization.NO_PERMISSION_TO_ACCESS : utils.getDataFromResponceError(error, 'msg');
  if (errorMessage) {
    Toast(errorMessage, { autoClose: false });
  }
};

const allowedAssetsCount = 30;
class LinkedAssets extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groups: {},
    };
  }

  componentDidMount() {
    const { selectedAssets } = this.props;
    this.fetchAssets(selectedAssets);
  }

  componentDidUpdate(prevProps) {
    const { selectedAssets } = this.props;
    if (selectedAssets.toString() !== prevProps.selectedAssets.toString()) {
      this.fetchAssets(selectedAssets);
    }
  }

  fetchAssets = async (selectedAssets) => {
    if (selectedAssets.length >= allowedAssetsCount) return;
    this.setState({ isLoading: true });
    try {
      const groups = await Api.fetchLinkedAssets(selectedAssets);
      this.setState({ groups, isLoading: false });
    } catch (error) {
      handleError(error);
      this.setState({ isLoading: false });
    }
  };

  linkAssets = async () => {
    this.setState({ isLoading: true });
    const { selectedAssets } = this.props;

    try {
      /** @type {object[]} */
      const res = await Api.linkedAssetsLink(selectedAssets);
      const isAlreadyLinked = res.length === 0 || res.every((a) => !a.linkedAssets?.length);
      if (isAlreadyLinked) {
        Toast(localization.LinkedAssets.infoAlreadyLinked, { autoClose: false });
        this.setState({ isLoading: false });
      } else {
        this.fetchAssets(selectedAssets);
      }
    } catch (error) {
      handleError(error);
      this.setState({ isLoading: false });
    }

    Logger.log('User', 'InfoPanelLinkAssets', { selectedAssetsIds: selectedAssets });
  };

  unlink = async (assetsIds) => {
    this.setState({ isLoading: true });

    try {
      const res = await Api.linkedAssetsUnlink(assetsIds);
      if (res.count === 0) {
        Toast(localization.LinkedAssets.infoAlreadyUnlinked, { autoClose: false });
        this.setState({ isLoading: false });
      } else {
        this.fetchAssets(this.props.selectedAssets);
      }
    } catch (error) {
      handleError(error);
      this.setState({ isLoading: false });
    }

    Logger.log('User', 'InfoPanelUnlinkAssets', { selectedAssetsIds: this.props.selectedAssets });
  };

  unlinkFrom = async (assetId) => {
    this.setState({ isLoading: true });

    try {
      await Api.linkedAssetsUnlinkFrom(assetId);
      this.setState({ isLoading: false });
      this.fetchAssets(this.props.selectedAssets);
    } catch (error) {
      handleError(error);
      this.setState({ isLoading: false });
    }
  };

  onClickHandler = (tagId) => {
    navigate(`/preview/${tagId}`);
  };

  render() {
    const { state, props } = this;
    const { groups, isLoading } = state;
    const { selectedAssets, disabled } = props;

    return (
      <Choose>
        <When condition={selectedAssets.length < allowedAssetsCount}>
          <div className={cn('linkedAssets', { isLoading })}>
            <Choose>
              <When condition={isLoading}>
                <div className="linkedAssetsList">
                  {selectedAssets.map((item) => (
                    <SkeletonItem key={item} />
                  ))}
                </div>
              </When>
              <Otherwise>
                <div className="linkedAssetsList">
                  {Object.keys(groups).map((key) => (
                    <Group
                      key={groups[key]._id}
                      group={groups[key]}
                      primaryAssetId={groups[key]._id}
                      selectedAssets={selectedAssets}
                      unlink={!disabled && this.unlink}
                      unlinkFrom={!disabled && this.unlinkFrom}
                      onClickHandler={this.onClickHandler}
                    />
                  ))}
                </div>
                <If condition={selectedAssets.length >= 2}>
                  <div className="linkedAssetsButtons">
                    <Button
                      id="button-LinkAssets"
                      disabled={disabled}
                      variant="contained"
                      color="secondary"
                      onClick={this.linkAssets}
                      size="md"
                      fullWidth
                    >
                      {localization.LinkedAssets.buttonLinkAssets}
                    </Button>
                    <Button
                      id="button-UnlinkAssets"
                      disabled={disabled}
                      variant="contained"
                      color="secondary"
                      onClick={() => this.unlink(selectedAssets)}
                      size="md"
                      fullWidth
                    >
                      {localization.LinkedAssets.buttonUnlinkAssets}
                    </Button>
                  </div>
                </If>
              </Otherwise>
            </Choose>
          </div>
        </When>
        <Otherwise>
          <div className="detailsPanel__placeholder">
            {localization.LinkedAssets.placeholder(allowedAssetsCount)}
          </div>
        </Otherwise>
      </Choose>
    );
  }
}

LinkedAssets.defaultProps = {
  disabled: false,
};

LinkedAssets.propTypes = {
  selectedAssets: arrayOf(string).isRequired,
  disabled: bool,
};

export default LinkedAssets;
