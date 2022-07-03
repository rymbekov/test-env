import React from 'react';
import { arrayOf, string, object } from 'prop-types';
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import localization from '../../shared/strings';
import * as utils from '../../shared/utils';

// store
import store from '../../store';
import * as actions from '../../store/actions/assets';
import * as mainActions from '../../store/actions/main';

import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';
import Logger from '../../services/Logger';
import Image from '../previewView/views/Image';
import Video from '../previewView/views/Video';
import Multipage from '../previewView/views/Multipage/index';
import Pdf from '../previewView/views/Pdf';
import { back, navigate, reloadApp } from '../../helpers/history';
import { showDialog } from '../dialog';

class Compare extends React.Component {
  /** propTypes */
  static propTypes = {
    ids: arrayOf(string),
    assets: arrayOf(object),
  };

  /** state */
  state = {
    isLoaded: false,
    requestSent: false,
    isPagesLoading: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.assets.length === 2) {
      return { isLoaded: true };
    }
    if (!prevState.requestSent) {
      nextProps.actions.getTmpAssets(nextProps.ids);
      return { requestSent: true };
    }
    return null;
  }

  handleDestroy = () => {
    this.props.actions.removeTmpItems();
    back();
  };

  render() {
    const { props, state } = this;

    if (!props.subscriptionFeatures.diffTool) {
      return (
        <div className="page compare">
          <ToolbarScreenTop
            title={[localization.TOOLBARS.titleCompareAssets]}
            onClose={this.handleDestroy}
          />
          <div className="compareText">
            <p>
              {/* @TODO: free plan - change texts, add right placeholder */}
              Please note that assets comparing functionality is not available on your plan.
              <br />
              <span
                className="picsioLink"
                onClick={() => navigate('/billing?tab=overview')}
              >
                Change plan now
              </span>{' '}
              to use this functionality.
            </p>
          </div>
        </div>
      );
    }

    if (!state.isLoaded) {
      return (
        <div className="page compare">
          <ToolbarScreenTop
            title={[localization.TOOLBARS.titleCompareAssets]}
            onClose={this.handleDestroy}
          />
          <div className="compareText">
            <h1>{localization.SPINNERS.LOADING}</h1>
          </div>
        </div>
      );
    }
    const asset1 = props.assets[0];
    const asset2 = props.assets[1];

    return (
      <div className="page compare">
        <ToolbarScreenTop
          title={[localization.TOOLBARS.titleCompareAssets]}
          onClose={this.handleDestroy}
        />
        <Choose>
          <When condition={utils.canBeCompared(this.props.assets, this.props.userSettings)}>
            <Choose>
              <When condition={asset1.isVideo}>
                <Video model={asset1} diffVideo={asset2} />
              </When>
              <When condition={asset1.isPdf}>
                <Pdf
                  asset={asset1}
                  diffAsset={asset2}
                  isAssetsComparing
                  diffRevisionNumber={asset2.name}
                  activeRevisionNumber={asset1.name}
                />
              </When>
              <When condition={!!asset1.pages && !!asset2.pages}>
                <Multipage
                  model={asset1}
                  isAssetsComparing
                  asset2Id={asset2._id}
                  diffPages={asset2.pages.head}
                  diffRevisionNumber={asset1.name}
                  activeRevisionNumber={asset2.name}
                  getPages={props.actions.getPages}
                />
              </When>
              <Otherwise>
                <Image
                  data={asset1}
                  diffAsset={asset2}
                  activeRevisionNumber={asset1.name}
                  diffRevisionNumber={asset2.name}
                  mainActions={props.mainActions}
                />
              </Otherwise>
            </Choose>
          </When>
          <Otherwise>
            <div className="compareText">
              <h1>{localization.COMPARE.wrongParameters.title}</h1>
              <p>{localization.COMPARE.wrongParameters.text}</p>
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  assets: state.assets.items.filter((item) => props.ids.includes(item._id)),
  subscriptionFeatures: state.user.subscriptionFeatures || {},
  userSettings: state.user.settings || {},
});
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  mainActions: bindActionCreators(mainActions, dispatch),
});

const ConnectedCompare = connect(mapStateToProps, mapDispatchToProps)(Compare);

export default function ({ match }) {
  const ids = match.params.ids.split('=');

  if (ids.length !== 2) {
    const { text } = localization.COMPARE.wrongParameters;
    showDialog({
      title: localization.COMPARE.wrongParameters.title,
      text,
      textBtnOk: 'Ok',
      textBtnCancel: null,
      onOk: reloadApp,
      onCancel: reloadApp,
    });
    Logger.error(new Error('Wrong parameters for assets comparing'), { ids }, [
      'CompareWrongParameters',
      `length: ${ids.length}`,
    ]);
    return null;
  }

  return (
    <div className="pageWrapper">
      <Provider store={store}>
        <ConnectedCompare ids={ids} />
      </Provider>
    </div>
  );
}
