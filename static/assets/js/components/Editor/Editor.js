import React from 'react';
import ReactDOM from 'react-dom';
import {
  string, object, objectOf, func,
} from 'prop-types';
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from '../../store';
import { getTmpAssets } from '../../store/actions/assets';

import ErrorBoundary from '../ErrorBoundary';
import Icon from '../Icon';

import localization from '../../shared/strings';
import revisionUploader from '../../helpers/revisionUploader';
import { downloadFile } from '../../helpers/fileDownloader';
import ProgressBar from '../ProgressBar';
import * as utils from '../../shared/utils';
import getDownloadUrl from '../../helpers/getDownloadUrl';
import { back } from '../../helpers/history';
import { showDialog } from '../dialog';

const $develop = document.querySelector('#develop');

class Editor extends React.Component {
  /** Editor config */
  editorConfig = {
    environment: {
      theme: this.props.user.settings.picsioTheme === 'light' ? 3 : 1,
      lang: 'en',
      intro: false,
      menus: [
        [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0], // File
        1, // Edit
        1, // Image
        1, // Layer
        1, // Select
        1, // Filter
        1, // View
        1, // Window
        [1, 1, 0, 1, 1], // More
      ],
      customIO: {
        open: 'app.echoToOE("try to open file")',
        save: 'app.echoToOE("save as revision")',
      },
    },
  };

  canSaveAsRevision = false;

  isFileLoadingStarts = false;

  isFileSendedToEditor = false;

  file = null;

  isIframeLoaded = false;

  /**
   * @type {boolean} - uses if user press "Cmd+s" and then in the pop-up press "Continue editing"
   */
  isChangesSaved = true;

  $editor = React.createRef();

  state = {
    fileLoadingProgress: 0,
    revisionLoadingProgress: null,
    isFileOpening: false,
    isEditorReady: false,
  };

  componentDidMount() {
    const { props } = this;
    $develop.style.display = 'block';

    if (!props.model) {
      props.actions.getTmpAssets([props.id]);
    } else {
      this.getFile();
    }
  }

  componentDidUpdate() {
    if (!this.isFileLoadingStarts && this.props.model) {
      this.getFile();
    }
  }

  componentWillUnmount() {
    $develop.style.display = 'none';
    back();
    window.removeEventListener('message', this.messagesFromEditorListener);
  }

  destroy = () => {
    ReactDOM.unmountComponentAtNode($develop);
  };

  getFile = async () => {
    this.checkSaveRevision();
    this.isFileLoadingStarts = true;
    this.setState({ fileLoadingProgress: 0 });

    const onProgress = ({ loaded, total }) => {
      const percentComplete = (loaded / total) * 100;
      this.setState({ fileLoadingProgress: parseInt(percentComplete) });
    };

    try {
      const url = await getDownloadUrl({ assetId: this.props.model._id, allowDownloadByGS: false });
      this.file = await downloadFile(url, 'arraybuffer').promise.progress(onProgress);
    } catch (error) {
      const { TITLE, TEXT } = localization.DIALOGS.EDITOR_CANT_DOWNLOAD_FILE;
      showDialog({
        title: TITLE,
        text: TEXT,
        textBtnCancel: null,
        textBtnOk: localization.DIALOGS.btnOk,
      });
      this.destroy();
      return;
    }

    this.setState({ fileLoadingProgress: null });
    if (this.isIframeLoaded) this.sendFileToEditor();
  };

  checkSaveRevision = () => {
    const asset = this.props.model;
    const fileExtension = asset.fileExtension.toLowerCase();
    const isRevisionsAllowed = asset.canUploadRevisions;
    const userHasUploadAccess = (asset.permissions || {}).upload;
    const dontShowAlertForExtensions = utils.LocalStorage.get('editorDontShowAlertForExtensions') || [];
    const possibleFileExtensions = ['png', 'psd', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'bmp', 'tiff', 'tif'];
    this.canSaveAsRevision = userHasUploadAccess
      && isRevisionsAllowed
      && possibleFileExtensions.includes(fileExtension);

    if (!this.canSaveAsRevision && !dontShowAlertForExtensions.includes(fileExtension)) {
      const { TITLE, TEXT, LABEL } = localization.DIALOGS.EDITOR_CANT_SAVE_AS_REVISION;
      showDialog({
        title: TITLE,
        text: TEXT(fileExtension, isRevisionsAllowed),
        checkbox: {
          label: LABEL(fileExtension),
        },
        textBtnCancel: null,
        textBtnOk: localization.DIALOGS.btnOk,
        onOk: ({ checkbox }) => {
          if (checkbox) {
            utils.LocalStorage.set('editorDontShowAlertForExtensions', [...dontShowAlertForExtensions, fileExtension]);
          }
        },
      });
    }
  };

  handleIframeLoad = () => {
    window.addEventListener('message', this.messagesFromEditorListener);
  };

  handleClose = () => {
    /** if editor has opened document - check if it saved */
    /** send message with key "close: ", and {boolean} value - saved */
    this.$editor.current.contentWindow.postMessage(
      'if (app.documents.length > 0) {app.echoToOE("close: " + app.activeDocument.saved)} else {app.echoToOE("close: true")}',
      '*',
    );
  };

  callEditorSaveRevision = () => {
    let fileExtension = this.props.model.fileExtension.toLowerCase();
    /** fix extension to save */
    if (fileExtension === 'jpeg') fileExtension = 'jpg';
    if (fileExtension === 'tif') fileExtension = 'tiff';
    this.$editor.current.contentWindow.postMessage(`app.activeDocument.saveToOE("${fileExtension}")`, '*');
  };

  messagesFromEditorListener = async (event) => {
    /** handle messages only from editor */
    if (event.origin !== 'https://www.photopea.com') return;

    /** Iframe loaded */
    if (!this.isIframeLoaded && event.data === 'done') {
      this.isIframeLoaded = true;
      if (this.file) this.sendFileToEditor();
    }

    /** File opened in editor */
    if (this.isFileSendedToEditor && event.data === 'done') {
      this.isFileSendedToEditor = false;
      this.setState({ isEditorReady: true, isFileOpening: false });
    }

    /** Save */
    if (event.data === 'save as revision' && this.canSaveAsRevision) {
      showDialog({
        title: localization.DIALOGS.EDITOR_SAVE_AS_REVISION.TITLE,
        text: localization.DIALOGS.EDITOR_SAVE_AS_REVISION.TEXT,
        textBtnCancel: localization.DIALOGS.EDITOR_SAVE_AS_REVISION.CANCEL_TEXT,
        textBtnOk: localization.DIALOGS.EDITOR_SAVE_AS_REVISION.OK_TEXT,
        onOk: () => {
          this.setState({ revisionLoadingProgress: 0 });
          this.callEditorSaveRevision();
          this.isChangesSaved = true;
        },
        onCancel: () => {
          this.isChangesSaved = false;
        },
      });
    }

    /** Close editor */
    if (typeof event.data === 'string' && event.data.startsWith('close: ')) {
      const saved = event.data.replace('close: ', '') === 'true' && this.isChangesSaved;
      if (saved || !this.canSaveAsRevision) {
        this.destroy();
        return;
      }

      const {
        TITLE, TEXT, CANCEL_TEXT, OK_TEXT,
      } = localization.DIALOGS.SAVE_EDITOR_CHANGES_DIALOG;
      showDialog({
        title: TITLE,
        text: TEXT,
        textBtnCancel: CANCEL_TEXT,
        textBtnOk: OK_TEXT,
        onOk: () => {},
        onCancel: this.destroy,
        onClose: () => {},
      });
    }

    /** Save file from editor */
    if (utils.isArrayBuffer(event.data)) {
      const fileBlob = new Blob([new Uint8Array(event.data)]);
      const file = new File([fileBlob], this.props.model.name, {
        type: this.props.model.mimeType,
        lastModified: new Date(),
      });

      await revisionUploader(file, this.props.model, (percent) => {
        this.setState({ revisionLoadingProgress: percent });
      });
      this.setState({ revisionLoadingProgress: null });
    }
  };

  sendFileToEditor = () => {
    const { name } = this.props.model;
    this.setState({ isFileOpening: true });
    this.isFileSendedToEditor = true;
    this.$editor.current.contentWindow.postMessage(this.file, '*');
    this.$editor.current.contentWindow.postMessage(
      `if (app.documents.length > 0) app.activeDocument.name = "${name}"`,
      '*',
    );
  };

  render() {
    const { state } = this;

    return (
      <>
        {state.fileLoadingProgress !== null && (
          <ProgressBar
            text={`Downloading file ${state.fileLoadingProgress ? `${state.fileLoadingProgress}%` : ''} ...`}
            percent={state.fileLoadingProgress}
          />
        )}
        {state.revisionLoadingProgress !== null && (
          <ProgressBar text="New Revision is loading ..." percent={state.revisionLoadingProgress} />
        )}
        {state.isFileOpening && <ProgressBar text="Opening file ..." percent={0} />}
        <div
          id="button-developViewClose"
          className="toolbarButton mobileHidden"
          onClick={this.handleClose}
          onKeyDown={this.handleClose}
          role="button"
          tabIndex={0}
        >
          <Icon name="close" />
        </div>
        <iframe
          title="Editor"
          id="photopea"
          ref={this.$editor}
          style={{ opacity: state.isEditorReady ? 1 : 0, border: 'none' }}
          onLoad={this.handleIframeLoad}
          width="100%"
          height="100%"
          src={`https://www.photopea.com/#${encodeURI(JSON.stringify(this.editorConfig))}`}
        />
      </>
    );
  }
}

const mapStateToProps = (state, props) => ({
  model: state.assets.items.find((item) => item._id === props.id),
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({ getTmpAssets }, dispatch),
});

Editor.propTypes = {
  id: string.isRequired,
  model: object.isRequired,
  actions: objectOf(func).isRequired,
};

const ConnectedEditor = connect(mapStateToProps, mapDispatchToProps)(Editor);

export default ({ match }) => {
  ReactDOM.render(
    <ErrorBoundary className="errorBoundaryPage">
      <Provider store={store}>
        <ConnectedEditor id={match.params.id} />
      </Provider>
    </ErrorBoundary>,
    $develop,
  );

  return null;
};
