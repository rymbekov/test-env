import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
} from '@picsio/ui';
import {
  CsvFiletype,
} from '@picsio/ui/dist/icons';
import cn from 'classnames';
import localization from '../../shared/strings';

const ImportCsvError = (props) => {
  const { errorReason, setImportingStatus, closeView } = props;

  return (
    <div className="validateCsvPage">
      <div className="chooseCsvWrapper validatePage">
        <Icon className="validateIcon error">
          <CsvFiletype />
        </Icon>
        <div className="chooseCsvTitle validate" data-testid="csv-error-title">
          {localization.CSV_IMPORT.importingError}
        </div>
        <div className="errorReason" data-testid="csv-error-reason">{errorReason}</div>
        <div>
          <div className="picsioDefBtn browseButton" onClick={closeView} data-testid="csv-close-pageButton">
            {localization.CSV_IMPORT.close}
          </div>
          <div
            className={cn('picsioDefBtn btnCallToAction saveButton')}
            onClick={() => setImportingStatus('choose')}
            data-testid="csvUploadBrowseButton"
          >
            {localization.CSV_IMPORT.importNewCsv}
          </div>
        </div>
      </div>
    </div>
  );
};

ImportCsvError.propTypes = {
  errorReason: PropTypes.string.isRequired,
  setImportingStatus: PropTypes.func.isRequired,
  closeView: PropTypes.func.isRequired,
};

export default ImportCsvError;
