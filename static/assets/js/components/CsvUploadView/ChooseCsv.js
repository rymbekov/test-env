import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Icon, Button,
} from '@picsio/ui';
import {
  CsvImport, Question,
} from '@picsio/ui/dist/icons';
import Logger from '../../services/Logger';
import * as helpers from '../import/helpers';
import { showDialog } from '../dialog';
import localization from '../../shared/strings';
import { validateCsvFile } from './helpers';

const ChooseCsv = (props) => {
  const { setImportingStatus, handleFileUpload } = props;
  const dragndropRef = useRef(null);

  const handleDropFiles = useCallback(async (event) => {
    event.preventDefault();
    if (event.dataTransfer) {
      const { items } = event.dataTransfer;
      if (items.length > 1) {
        return showDialog({
          title: localization.CSV_IMPORT.canUploadOnlyOneFileDialogTitle,
          text: localization.CSV_IMPORT.canUploadOnlyOneFileDialogText,
          textBtnCancel: null,
          onOk() {},
        });
      }
      if (items.length) {
        const promises = [];
        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry();
          if (entry) {
            promises.push(helpers.getFilesFromEntry(entry));
          }
        }
        let files;
        try {
          files = await Promise.all(promises);
          if (validateCsvFile(files[0]?.file)) {
            showDialog({
              title: localization.CSV_IMPORT.validationDialogTitle,
              text: localization.CSV_IMPORT.validationDialogText,
              textBtnCancel: null,
              onOk() {},
            });
          } else {
            handleFileUpload(files[0]?.file);
            setImportingStatus('readyToImport');
          }
        } catch (e) {
          Logger.error(new Error('Can not drop csv files error'), { error: e });
        }
      }
    }
  }, [handleFileUpload, setImportingStatus]);

  const handleOnChange = useCallback((event) => {
    const csv = event.target.files && event.target.files[0];
    if (validateCsvFile(csv)) {
      showDialog({
        title: localization.CSV_IMPORT.validationDialogTitle,
        text: localization.CSV_IMPORT.validationDialogText,
        textBtnCancel: null,
        onOk() {},
      });
    } else {
      handleFileUpload(csv);
      setImportingStatus('readyToImport');
    }
  }, [handleFileUpload, setImportingStatus]);

  const handleDragEnter = useCallback((event) => {
    dragndropRef.current.children[0].classList.add('dragEnter');
    event.preventDefault();
  }, []);

  const handleDragLeave = useCallback((event) => {
    dragndropRef.current.children[0].classList.remove('dragEnter');
    event.preventDefault();
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const setDropListeners = () => {
    dragndropRef.current.addEventListener('drop', handleDropFiles);
    dragndropRef.current.addEventListener('dragenter', handleDragEnter);
    dragndropRef.current.addEventListener('dragover', handleDragOver);
    dragndropRef.current.addEventListener('dragleave', handleDragLeave);
  };

  const removeDropListeners = () => {
    if (dragndropRef.current) {
      dragndropRef.current.removeEventListener('drop', handleDropFiles);
      dragndropRef.current.removeEventListener('dragenter', handleDragEnter);
      dragndropRef.current.removeEventListener('dragover', handleDragOver);
      dragndropRef.current.addEventListener('dragleave', handleDragLeave);
    }
  };

  useEffect(() => {
    setDropListeners();
    return removeDropListeners;
  }, []);

  // TODO change link
  const handleClickHelp = useCallback(() => {
    window.open('https://help.pics.io/en/articles/1269153-uploading-new-files', '_blank');
    Logger.log('User', 'Help', 'uploadPanel');
  }, []);

  return (
    <div className="chooseCsvWrapper">
      <div className="chooseCsvTitle" data-testid="import-csv-title">
        {localization.CSV_IMPORT.importTitle}
      </div>
      <div className="chooseCsvSubtitle" data-testid="import-csv-subtitle">
        {localization.CSV_IMPORT.importText()}
      </div>
      <Button
        variant="text"
        color="primary"
        startIcon={<Question />}
        onClick={handleClickHelp}
        className="csvImportHelpLink"
        componentProps={{
          'data-testid': 'import-csv-inpage-help-link',
        }}
      >
        {localization.CSV_IMPORT.learnMore}
      </Button>
      <div className="chooseCsvDragnDrop" ref={dragndropRef} data-testid="import-csv-dragndrop">
        <Icon className="csvUploadIcon">
          <CsvImport />
        </Icon>
        <div className="title">
          {localization.CSV_IMPORT.dragnDrop}
        </div>
        <div className="subtitle">
          {localization.CSV_IMPORT.or}
        </div>
        <div className="picsioDefBtn btnCallToAction browseButton" data-testid="import-csv-dragndrop-browse-button">
          <label>{localization.CSV_IMPORT.browse}</label>
          <input className="browseInput" accept="text/csv" type="file" onChange={handleOnChange} />
        </div>
      </div>
    </div>
  );
};

ChooseCsv.propTypes = {
  setImportingStatus: PropTypes.func.isRequired,
  handleFileUpload: PropTypes.func.isRequired,
};

export default ChooseCsv;
