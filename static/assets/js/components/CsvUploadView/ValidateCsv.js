import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
} from '@picsio/ui';
import {
  CsvFiletype,
} from '@picsio/ui/dist/icons';
import cn from 'classnames';
import { showDialog } from '../dialog';
import localization from '../../shared/strings';
import { validateCsvFile } from './helpers';

const ValidateCsv = (props) => {
  const { handleFileUpload, fileName, handleImport } = props;

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
    }
  }, []);

  return (
    <div className="validateCsvPage">
      <div className="chooseCsvWrapper validatePage">
        <Icon className="validateIcon">
          <CsvFiletype />
        </Icon>
        <div className="chooseCsvTitle validate" data-testid="validate-titleText">
          {`Your CSV ${fileName} is ready to import`}
        </div>
        <div>
          <div className="picsioDefBtn browseButton" data-testid="validate-browseButton">
            <label>{localization.CSV_IMPORT.browse}</label>
            <input className="browseInput" accept="text/csv" type="file" onChange={handleOnChange} />
          </div>
          <div
            className={cn('picsioDefBtn btnCallToAction saveButton')}
            onClick={handleImport}
            data-testid="csvValidateImportButton"
          >
            {localization.CSV_IMPORT.import}
          </div>
        </div>
      </div>
    </div>
  );
};

ValidateCsv.propTypes = {
  fileName: PropTypes.string.isRequired,
  handleImport: PropTypes.func.isRequired,
  handleFileUpload: PropTypes.func.isRequired,
};

export default ValidateCsv;
