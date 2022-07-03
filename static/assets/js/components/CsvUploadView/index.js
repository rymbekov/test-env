import React, { useCallback, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import ChooseCsv from './ChooseCsv';
import ValidateCsv from './ValidateCsv';
import ImportCsvError from './ImportCsvError';
import ImportCsvComplete from './ImportCsvComplete';
import UiBlocker from '../../services/UiBlocker';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';
import { isHaveTeammatePermission } from '../../store/helpers/user';
import { showDialog } from '../dialog';
import sdk from '../../sdk';
import './styles.scss';

let cancelCsvUpload = null;

const CsvUploadView = (props) => {
  const csvImportPageRef = useRef();
  const [step, setStep] = useState('choose');
  const [file, setFile] = useState();
  const [error, setError] = useState();
  const [response, setResponse] = useState();
  const { history } = props;

  const setImportingStatus = useCallback((arg) => {
    setStep(arg);
  }, []);

  const closeView = useCallback(() => {
    if (typeof cancelCsvUpload === 'function') {
      cancelCsvUpload();
    }
    Logger.log('User', 'CloseCsvImportPage');
    history.goBack();
  }, []);

  const handleDone = useCallback(() => {
    Logger.log('User', 'CsvImportDone');
    const prev = history?.entries[1];
    const prevUrl = prev?.pathname + prev?.search;
    if (prevUrl) {
      history.replace(prevUrl);
    } else {
      history.goBack();
    }
  }, []);

  const handleFileUpload = useCallback((arg) => {
    Logger.log('User', 'CsvFileUpload');
    setFile(arg);
  }, []);

  const handleImport = useCallback(async () => {
    try {
      Logger.log('User', 'ImportCsv');
      UiBlocker.block('Importing...');
      const { cancel, promise } = sdk.assets.uploadCsv(file);
      cancelCsvUpload = cancel;
      const res = await promise;
      setResponse(res.data);
      setStep('done');
    } catch (err) {
      Logger.log('err', err);
      setError(err.response.data.msg);
      setStep('error');
    } finally {
      UiBlocker.unblock();
      cancelCsvUpload = null;
    }
  }, [file]);

  const handleDragEnter = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDropFiles = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const setDropListeners = () => {
    csvImportPageRef?.current?.addEventListener('drop', handleDropFiles);

    csvImportPageRef?.current?.addEventListener('dragenter', handleDragEnter);
    csvImportPageRef?.current?.addEventListener('dragover', handleDragOver);
  };

  const removeDropListeners = () => {
    if (csvImportPageRef.current) {
      csvImportPageRef?.current?.addEventListener('drop', handleDropFiles);
      csvImportPageRef?.current?.removeEventListener('dragenter', handleDragEnter);
      csvImportPageRef?.current?.removeEventListener('dragover', handleDragOver);
    }
  };

  useEffect(() => {
    setDropListeners();
    return removeDropListeners;
  }, []);

  if (!isHaveTeammatePermission('importCSV')) {
    Logger.log('Ui', 'CsvImportDialogShow');

    showDialog({
      title: localization.CSV_IMPORT.importNewCsv,
      textBtnOk: null,
      text: localization.CSV_IMPORT.hasNoAccessDialogTitle,
      textBtnCancel: localization.TEAMMATES_DIALOG.btnOk,
      onCancel: () => {
        Logger.log('User', 'CsvImportDialogCancel');
        history.goBack();
      },
    });

    return null;
  }

  return (
    <div className="pageWrapper wrapperPageMyAccount" ref={csvImportPageRef}>
      <ErrorBoundary className="errorBoundaryPage">
        <div className="page">
          <ToolbarScreenTop
            onClose={closeView}
            title={['Import your CSV file']}
            helpLink="articles/1269153-uploading-new-files"
          />
          <div className="pageContent pageVertical">
            <div className="pageInnerContent">
              <div className="csvUploadViewWrapper">
                <Choose>
                  <When condition={step === 'choose'}>
                    <ChooseCsv
                      setImportingStatus={setImportingStatus}
                      handleFileUpload={handleFileUpload}
                    />
                  </When>
                  <When condition={step === 'readyToImport'}>
                    <ValidateCsv
                      setImportingStatus={setImportingStatus}
                      handleFileUpload={handleFileUpload}
                      fileName={file.name}
                      handleImport={handleImport}
                    />
                  </When>
                  <When condition={step === 'done'}>
                    <ImportCsvComplete
                      closeView={handleDone}
                      setImportingStatus={setImportingStatus}
                      data={response}
                      fileName={file.name}
                    />
                  </When>
                  <When condition={step === 'error'}>
                    <ImportCsvError
                      setImportingStatus={setImportingStatus}
                      errorReason={error}
                      closeView={closeView}
                    />
                  </When>
                </Choose>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </div>

  );
};

CsvUploadView.propTypes = {
  history: PropTypes.shape(PropTypes.any).isRequired,
};

export default CsvUploadView;
