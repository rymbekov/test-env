import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
} from '@picsio/ui';
import {
  CsvFiletype,
} from '@picsio/ui/dist/icons';
import cn from 'classnames';
import localization from '../../shared/strings';
import Logger from '../../services/Logger';

const ImportCsvComplete = (props) => {
  const {
    closeView, setImportingStatus, fileName, data,
  } = props;

  const openInNewTab = useCallback(() => {
    Logger.log('User', 'DownloadCsvReport');
    window.open(data?.downloadUrl, '_blank').focus();
  }, [data.downloadUrl]);

  return (
    <div className="validateCsvPage">
      <div className="chooseCsvWrapper validatePage">
        <Icon className="validateIcon success">
          <CsvFiletype />
        </Icon>
        <If condition={data?.background}>
          <div className="chooseCsvTitle validate" data-testid="csv-complete-background-longText">
            {localization.CSV_IMPORT.takingTooLong}
          </div>
          <div>
            <div className="picsioDefBtn btnCallToAction browseButton" onClick={closeView} data-testid="csv-complete-background-longButton">
              {localization.CSV_IMPORT.done}
            </div>
          </div>
        </If>
        <If condition={!data?.background}>
          <div className="chooseCsvTitle validate" data-testid="complete-text">
            {`Importing ${fileName} complete`}
          </div>
          <div>
            <div data-testid="csv-complete-assets-updated">{`Assets updated - ${data?.updatedAssetsCount}`}</div>
            <div data-testid="csv-complete-assets-not-updated">{`Assets did not update - ${data?.invalidRowsCount}`}</div>
          </div>
          <div className="doneButtons">
            <div
              className={cn('picsioDefBtn saveButton importNew')}
              onClick={() => setImportingStatus('choose')}
              data-testid="csvUploadBrowseButton"
            >
              {localization.CSV_IMPORT.importNewCsv}
            </div>
            <If condition={data?.downloadUrl}>
              <div
                className="picsioDefBtn btnCallToAction browseButton"
                data-testid="csvCompleteDownloadReportButton"
                onClick={openInNewTab}
              >
                {localization.CSV_IMPORT.downloadReport}
              </div>
            </If>
            <If condition={!data?.downloadUrl}>
              <div
                className="picsioDefBtn btnCallToAction browseButton"
                data-testid="csvCompleteDownloadReportButton"
                onClick={closeView}
              >
                {localization.CSV_IMPORT.done}
              </div>
            </If>
          </div>
          <If condition={data?.downloadUrl}>
            <div>{localization.CSV_IMPORT.refreshText}</div>
          </If>
        </If>
      </div>
    </div>
  );
};

ImportCsvComplete.propTypes = {
  data: PropTypes.shape({
    background: PropTypes.bool,
    updatedAssetsCount: PropTypes.number,
    invalidRowsCount: PropTypes.number,
    downloadUrl: PropTypes.string,
  }).isRequired,
  fileName: PropTypes.string.isRequired,
  setImportingStatus: PropTypes.func.isRequired,
  closeView: PropTypes.func.isRequired,
};

export default ImportCsvComplete;
