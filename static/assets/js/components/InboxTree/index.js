import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AddCircleFilledBold } from '@picsio/ui/dist/icons';
import localization from '../../shared/strings';
import ua from '../../ua';
import Logger from '../../services/Logger';
import Icon from '../Icon';
import ErrorBoundary from '../ErrorBoundary';

import TreePlaceholder from '../TreePlaceholder';
import TreePlaceholderError from '../TreePlaceholderError';
import { Textarea, Button } from '../../UIComponents';

import * as inboxesActions from '../../store/inboxes/actions';
import * as collectionsActions from '../../store/actions/collections';
import * as mainActions from '../../store/actions/main';
import * as userActions from '../../store/actions/user';
import Spinner from './Spinner';
import Inbox from './Item';
import SearchBar from '../SearchBar';
import { setSearchRoute } from '../../helpers/history';
import TreeButton from '../TreeButton';

class InboxTree extends React.Component {
  liStyle = { paddingLeft: 38 };

  constructor(props) {
    super(props);

    this.state = {
      inboxes: [],
      isAdding: false,
      isValid: true,
    };
  }

  componentDidMount() {
    const { store } = this.props;
    const { manageInboxes } = this.props.userPermissions;
    if ((store.inboxes === null || !store.inboxes?.length) && manageInboxes && !store.isLoaded) this.props.inboxesActions.getInboxes();
  }

  componentDidUpdate(prevProps) {
    if (this.props.openedTree === 'inbox' && this.props.openedTree !== prevProps.openedTree) {
      this.props.inboxesActions.applySearch('');
    }
  }

  /**
   * Select item
   * @param {string} id
   */
  select = (id) => {
    Logger.log('User', 'InboxesPanelSelectInbox', id);
    setSearchRoute({ inboxId: id });
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
    setSearchRoute({ inboxId: id });
  };

  addInbox = () => {
    Logger.log('User', 'InboxesPanelAddInbox');
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
    this.props.inboxesActions.create(name);
    this.setState({ isAdding: false, isValid: true });
  };

  stopPropagation = (event) => event.stopPropagation();

  /**
   * Handle keydown on textarea
   * @param {InboxEvent} event
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
    const nodes = this.props.store.inboxes;
    let isValid = true;
    const checkName = (item) => decodeURIComponent(item.name.toLowerCase()) === decodeURIComponent(value);

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
    Logger.log('User', 'InboxesPanelAddInboxConfirm');
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
    Logger.log('User', 'InboxesPanelAddInboxCancel');
    this.btnCLicked = true;
    this.setState({ isValid: true, isAdding: false });
  };

  handleInputFocus = () => {
    this.setState({ isAdding: true });
  };

  setSort = (sortType) => {
    this.props.userActions.updateUserSortType({ collectionType: 'inboxes', sortType });
  }

  getInboxes = () => {
    Logger.log('User', 'GetInboxesClick');
    this.props.inboxesActions.getInboxes();
  }

  render() {
    if (this.props.openedTree !== 'inbox') return null;
    const {
      isLoaded, isLoading, error, inboxes, filtredInboxes, activeInboxID,
    } = this.props.store;
    const { state, props } = this;
    const { inboxes: isInboxesAllowed } = props.subscriptionFeatures;
    const inboxesForTree = filtredInboxes === null ? [...inboxes] : [...filtredInboxes];

    if (isLoading || (!isLoaded && error)) {
      return (
        <div className="tree">
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
                  buttonId="getInboxes"
                  title={localization.INBOXESTREE.title}
                  description="Failed to load inboxes. Click the button below to try again."
                  icon="placeholderInbox"
                  handleClick={this.getInboxes}
                  isBusy={!isLoaded && !error}
                  buttonText="Load inboxes"
                  isFeatureAllowed={isInboxesAllowed}
                />
              </Otherwise>
            </Choose>
          </div>
        </div>
      );
    }

    const inboxesList = inboxesForTree.map((inbox) => (
      <Inbox
        key={inbox._id}
        node={inbox}
        allInboxes={inboxes}
        activeInbox={activeInboxID}
        handlers={{
          inputUpload: this.filesUpload,
          remove: props.inboxesActions.remove,
          rename: props.inboxesActions.rename,
          dragstart: null,
          item: this.select,
          uploadClick: this.onClickUpload,
        }}
      />
    ));

    if (inboxes.length === 0) {
      return (
        <div className="_wrapperTree tree">
          <div className="folderTreeView" style={{ width: props.panelWidth }}>
            <div className="treeResizer" onMouseDown={(event) => this.props.mainActions.resizePanel(event, 'left')} />
            <TreePlaceholder
              buttonId="createInbox"
              title={localization.INBOXESTREE.title}
              description={localization.INBOXESTREE.placeholderNoInbox}
              icon="placeholderInbox"
              add={this.add}
              validate={this.validate}
              error={this.state.isValid}
              isBusy={props.inboxCreating}
              isFeatureAllowed={isInboxesAllowed}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="_wrapperTree tree">
        <ErrorBoundary className="errorBoundaryComponent">
          <div className="folderTreeView" style={{ width: props.panelWidth }}>
            <div className="treeResizer" onMouseDown={(event) => this.props.mainActions.resizePanel(event, 'left')} />
            <SearchBar
              applySearch={props.inboxesActions.applySearch}
              placeholder={localization.INBOXESTREE.placeholderSearch}
              defaultValue={props.store.searchQuery}
              openedTree={this.props.openedTree}
              sortType={this.props.sortType}
              setSort={this.setSort}
              hiddenSorts={['updatedAt']}
            />
            <div className="treeList listFolderTree">
              {!isLoaded && <Spinner />}
              <div className="treeList-title">
                <div className="treeList-title-text">{localization.INBOXESTREE.title}</div>
                <div className="btnsManageCollection">
                  <TreeButton
                    key="addCollection"
                    icon={() => <AddCircleFilledBold />}
                    className="btnCollection"
                    additionalClassName="btnAddFolder"
                    tooltip={localization.INBOXESTREE.textCreateInbox}
                    onClick={this.addInbox}
                  />
                </div>
              </div>
              {state.isAdding && (
                <ul id="addingInbox">
                  <li>
                    <span className="nameFolder rightShadow editModeFolder" style={{ paddingLeft: 50 }}>
                      <div className="btnsEditCollection leftShadow">
                        <TreeButton
                          key="ok"
                          icon="ok"
                          className={cn('btnCollection btnOkFolder', { disabled: !this.state.isValid })}
                          tooltip={localization.INBOXESTREE.textSave}
                          onClick={this.addInbox}
                        />
                        <TreeButton
                          key="close"
                          icon="close"
                          className="btnCollection btnCancelFolder"
                          tooltip={localization.INBOXESTREE.textCancel}
                          onClick={this.addInbox}
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
              {this.props.store.nameCreatingInbox !== null && (
                <ul>
                  <li>
                    <span className="nameFolder disabled" style={this.liStyle}>
                      <span className="iconHolder">
                        <Icon name="inbox" />
                      </span>
                      <span className="collectionTextValue">{this.props.store.nameCreatingInbox}</span>
                    </span>
                  </li>
                </ul>
              )}
              <ul role="tree" aria-labelledby="inboxes">
                {inboxesList}
              </ul>
            </div>
            <div className="treeButton">
              <Button id="button-createInbox" onClick={this.addInbox} type="submit">
                {localization.INBOXESTREE.textCreateInbox}
              </Button>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    );
  }
}

const defaultSortType = {
  type: 'createdAt',
  order: 'asc',
};

const ConnectedTree = connect(
  (store) => ({
    store: store.inboxes,
    inboxCreating: store.inboxes.nameCreatingInbox,
    openedTree: store.main.openedTree,
    panelWidth: store.main.panelsWidth.catalogView.left,
    userPermissions: store.user.role.permissions,
    subscriptionFeatures: store.user.subscriptionFeatures,
    sortType: store.user.inboxesSortType || defaultSortType,
  }),
  (dispatch) => ({
    inboxesActions: bindActionCreators(inboxesActions, dispatch),
    mainActions: bindActionCreators(mainActions, dispatch),
    userActions: bindActionCreators(userActions, dispatch),
    collectionsActions: bindActionCreators(collectionsActions, dispatch),
  }),
)(InboxTree);

export default ConnectedTree;
