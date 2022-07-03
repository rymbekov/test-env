import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AddCircleFilledBold } from '@picsio/ui/dist/icons';
import localization from '../../../shared/strings';
import ua from '../../../ua';
import Logger from '../../../services/Logger';

import TreePlaceholder from '../../TreePlaceholder';
import TreePlaceholderError from '../../TreePlaceholderError';

import * as actions from '../../../store/actions/lightboards';
import * as collectionsActions from '../../../store/actions/collections';
import { addToLightboard } from '../../../store/actions/assets';
import * as mainActions from '../../../store/actions/main';
import * as userActions from '../../../store/actions/user';
import { Textarea, Button } from '../../../UIComponents';
import Spinner from './Spinner';
import Lightboard from './Item';
import SearchBar from '../../SearchBar';
import { setSearchRoute } from '../../../helpers/history';
import TreeButton from '../../TreeButton';

const PD = '→';

class LightboardTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lightboards: [],
      isAdding: false,
      isValid: true,
    };
  }

  componentDidMount() {
    const { store } = this.props;
    if ((store.lightboards === null || !store.lightboards?.length) && !store.isLoaded) {
      this.props.actions.getLightboards();
    }
  }

  componentDidUpdate(nextProps) {
    // reset search value
    if (this.props.openedTree === 'lightboards' && this.props.openedTree !== nextProps.openedTree) {
      if (this.props.store.searchQuery) {
        this.props.actions.applySearch('');
      }
    }
  }

  /**
   * Select item
   * @param {string} id
   */
  select = (id) => {
    Logger.log('User', 'LightboardsPanelSelectLB', id);
    setSearchRoute({ lightboardId: id });
    /** hide tree */
    if (ua.isMobileApp() || (ua.browser.isNotDesktop() && window.innerWidth < 1024)) {
      this.props.mainActions.setMobileMainScreenPanel('catalog');
    }
  };

  /**
   * Handle click on button upload
   * @param {string} id
   */
  onClickUpload = (id) => {
    setSearchRoute({ lightboardId: id });
  };

  addLightboard = () => {
    Logger.log('User', 'LightboardsPanelAddLB');
    this.setState({ isAdding: true });
  };

  filesUpload = (event) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      window.dispatchEvent(new CustomEvent('importPanel:add', { detail: files }));
    }
    event.target.value = '';
  };

  /**
   * @param {string} _value
   */
  add = (_value) => {
    if (_value === '') {
      this.setState({ isAdding: false, isValid: true });
      return;
    }
    const name = _value.trim();
    const path = PD + name;
    this.props.actions.add(path);
    this.setState({ isAdding: false, isValid: true });
  };

  stopPropagation = (event) => event.stopPropagation();

  /**
   * Handle keydown on textarea
   * @param {LightboardEvent} event
   */
  onKeyDownTextarea = (event) => {
    const { isAdding } = this.state;
    const ENTER = 13;
    const ESC = 27;

    switch (event.keyCode) {
    case ENTER: {
      event.stopPropagation();
      if (isAdding) this.doAdd();
      break;
    }
    case ESC: {
      event.stopPropagation();
      if (isAdding) this.cancelAdd();
      break;
    }
    default:
      return true;
    }
  };

  refTextareaAdd = (textarea) => {
    this.textareaAdd = textarea;
    textarea && textarea.select();
  };

  onBlurAdd = (event) => {
    this.btnCLicked = false;
    const { value } = event.target;

    setTimeout(() => {
      if (!this.btnCLicked && this.state.isAdding) {
        if (this.state.isValid && value !== '') {
          this.add(value);
        } else {
          this.cancelAdd();
        }
      }
    }, 200);
  };

  onChangeTextarea = (event) => this.validate(event.target.value);

  validate = (_value) => {
    const value = _value.trim().toLowerCase();
    const nodes = this.props.store.lightboards;
    let isValid = true;
    const checkName = (item) => decodeURIComponent(
      item.path
        .split('→')
        .pop()
        .toLowerCase(),
    ) === decodeURIComponent(value);

    if (value.startsWith('.')) {
      // if the first symbol is .(dot)
      isValid = false;
    } else if (RegExp(/[%/\\(){}[\]]/, 'g').test(_value)) {
      isValid = false;
    } else if (value === '' || nodes.some(checkName)) {
      isValid = false;
    }

    this.setState({ isValid });
  };

  doAdd = () => {
    Logger.log('User', 'LightboardsPanelAddLBConfirm');
    this.btnCLicked = true;
    if (this.state.isValid && this.textareaAdd) {
      this.add(this.textareaAdd.value);
    } else if (this.textareaAdd) {
      this.textareaAdd.select();
    } else {
      this.cancelAdd();
    }
  };

  cancelAdd = () => {
    Logger.log('User', 'LightboardsPanelAddLBCancel');
    this.btnCLicked = true;
    this.setState({ isValid: true, isAdding: false });
  };

  handleInputFocus = () => {
    this.setState({ isAdding: true });
  };

  onDrop = (lightboard, isMove = false) => {
    const { _id, path } = lightboard;
    this.props.addToLightboardAction({
      lightboardID: _id, lightboardPath: path, assetIDs: undefined, isMove,
    });
  };

  setSort = (sortType) => {
    this.props.userActions.updateUserSortType({ collectionType: 'lightboards', sortType });
  }

  getLightboards = () => {
    Logger.log('User', 'GetLightboardsClick');
    this.props.actions.getLightboards();
  }

  render() {
    if (this.props.openedTree !== 'lightboards') return null;
    const {
      isLoaded, isLoading, lightboards, filtredLightboards, activeLightboard, error
    } = this.props.store;
    const { state, props } = this;

    if (isLoading || (!isLoaded && error)) {
      return (
        <div className="folderTreeView" style={{ width: props.panelWidth }}>
          <div className="treeResizer" onMouseDown={(event) => this.props.mainActions.resizePanel(event, 'left')} />
          <Choose>
            <When condition={isLoading}>
              <div className="treeList listFolderTree">
                <Spinner />
              </div>
            </When>
            <Otherwise>
              <TreePlaceholderError
                buttonId="getLightboards"
                title={localization.LIGHTBOARDSTREE.title}
                description="Failed to load lightboards. Click the button below to try again."
                icon="placeholderLightboard"
                handleClick={this.getLightboards}
                // error={this.state.isValid}
                isBusy={!isLoaded && !error}
                buttonText="Load lightboards"
              />
            </Otherwise>
          </Choose>
        </div>
      );
    }

    // todo: implement totalCount for all assets in lightboards
    const totalCount = null;
    const lightboardsForTree = filtredLightboards === null ? lightboards : filtredLightboards;

    const lightboardsList = lightboardsForTree.map((lightboard) => (
      <Lightboard
        key={lightboard._id}
        node={lightboard}
        allLightboards={lightboards}
        activeLightboard={activeLightboard?._id}
        handlers={{
          inputUpload: this.filesUpload,
          remove: props.actions.remove,
          rename: props.actions.rename,
          dragstart: null,
          drop: this.onDrop,
          item: this.select,
          uploadClick: this.onClickUpload,
        }}
        searchQuery={props.searchQuery}
      />
    ));

    if (lightboards.length === 0) {
      return (
        <div className="folderTreeView" style={{ width: props.panelWidth }}>
          <div className="treeResizer" onMouseDown={(event) => this.props.mainActions.resizePanel(event, 'left')} />
          <TreePlaceholder
            buttonId="createLightboard"
            title={localization.LIGHTBOARDSTREE.title}
            description={localization.LIGHTBOARDSTREE.placeholderNoLightboard}
            icon="placeholderLightboard"
            add={this.add}
            validate={this.validate}
            error={this.state.isValid}
            isBusy={props.store.isBusy}
          />
        </div>
      );
    }

    return (
      <div className="folderTreeView" style={{ width: props.panelWidth }}>
        <div className="treeResizer" onMouseDown={(event) => this.props.mainActions.resizePanel(event, 'left')} />
        <SearchBar
          applySearch={props.actions.applySearch}
          placeholder={localization.LIGHTBOARDSTREE.placeholderSearch}
          defaultValue={props.store.searchQuery}
          openedTree={this.props.openedTree}
          sortType={this.props.sortType}
          setSort={this.setSort}
          hiddenSorts={['updatedAt']}
        />
        <div className="treeList listFolderTree">
          {!isLoaded && <Spinner />}
          <div className="treeList-title">
            <div className="treeList-title-text">{localization.LIGHTBOARDS.title}</div>
            <div className="btnsManageCollection">
              <TreeButton
                key="addCollection"
                icon={() => <AddCircleFilledBold />}
                className="btnCollection btnAddFolder"
                tooltip={localization.LIGHTBOARDSTREE.textCreateLightboard}
                onClick={this.addLightboard}
              />
            </div>
            <span className="itemCount">{totalCount}</span>
          </div>
          {state.isAdding && (
            <ul id="addingLightboard">
              <li>
                <span className="nameFolder rightShadow editModeFolder" style={{ paddingLeft: 50 }}>
                  <div className="btnsEditCollection leftShadow">
                    <TreeButton
                      key="ok"
                      icon="ok"
                      className={cn('btnCollection btnOkFolder', { disabled: !this.state.isValid })}
                      tooltip={localization.LIGHTBOARDSTREE.textSave}
                      onClick={this.doAdd}
                    />
                    <TreeButton
                      key="close"
                      icon="close"
                      className="btnCollection btnCancelFolder"
                      tooltip={localization.LIGHTBOARDSTREE.textCancel}
                      onClick={this.cancelAdd}
                    />
                  </div>
                  <Textarea
                    isDefault
                    className={cn('collectionTextValue', { error: !this.state.isValid })}
                    defaultValue=""
                    onClick={this.stopPropagation}
                    onKeyDown={this.onKeyDownTextarea}
                    onBlur={this.onBlurAdd}
                    onChange={this.onChangeTextarea}
                    customRef={this.refTextareaAdd}
                  />
                </span>
              </li>
            </ul>
          )}
          <ul role="tree" aria-labelledby="lightboards">
            {lightboardsList}
          </ul>
        </div>
        <div className="treeButton">
          <Button id="button-createLightboard" onClick={this.addLightboard} type="submit">
            {localization.LIGHTBOARDS.buttonAddLightboard}
          </Button>
        </div>
      </div>
    );
  }
}

const defaultSortType = {
  type: 'createdAt',
  order: 'asc',
};

const ConnectedTree = connect(
  (state) => ({
    searchQuery: state.router.location.query,
    store: state.lightboards,
    openedTree: state.main.openedTree,
    panelWidth: state.main.panelsWidth.catalogView.left,
    sortType: state.user.lightboardsSortType || defaultSortType,
  }),
  (dispatch) => ({
    actions: bindActionCreators(actions, dispatch),
    addToLightboardAction: bindActionCreators(addToLightboard, dispatch),
    mainActions: bindActionCreators(mainActions, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
    collectionsActions: bindActionCreators(collectionsActions, dispatch),
  }),
)(LightboardTree);

export default ConnectedTree;
