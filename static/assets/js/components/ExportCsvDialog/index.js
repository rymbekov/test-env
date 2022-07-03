import React from 'react';
import { string, func, arrayOf } from 'prop-types';
import cn from 'classnames';
import * as assetsApi from '../../api/assets';
import Logger from '../../services/Logger';
import UiBlocker from '../../services/UiBlocker';
import localization from '../../shared/strings';
import { saveFile } from '../../shared/utils';
import * as utils from '../../shared/utils';

import { Radio, Checkbox } from '../../UIComponents';
import Icon from '../Icon';
import { getDefaultFields } from './config';
import Toast from '../Toast';

const { EXPORT_TO_CSV_DIALOG } = localization;

class ExportCsvDialog extends React.Component {
	/** propTypes */
	static propTypes = {
	  assetIds: arrayOf(string).isRequired,
	  destroy: func.isRequired,
	  title: string,
	  textBtnCancel: string,
	  textBtnOk: string,
	};

	/** default props */
	static defaultProps = {
	  title: EXPORT_TO_CSV_DIALOG.title,
	  textBtnCancel: EXPORT_TO_CSV_DIALOG.textBtnCancel,
	  textBtnOk: EXPORT_TO_CSV_DIALOG.textBtnOk,
	};

	KEY_ENTER = 13;

	KEY_ESC = 27;

	state = {
	  exportAll: true,
	  fields: getDefaultFields(),
	};

	componentDidMount() {
	  window.addEventListener('keydown', this.keyListener);
	}

	componentWillUnmount() {
	  window.removeEventListener('keydown', this.keyListener);
	}

	/** @param {KeyboardEvent} event */
	keyListener = (event) => {
	  switch (event.keyCode) {
	  case this.KEY_ENTER: {
	    this.submit();
	    break;
	  }
	  case this.KEY_ESC: {
	    this.cancel();
	    break;
	  }
	  }
	};

	cancel = () => this.props.destroy();

	submit = async () => {
	  UiBlocker.block('Processing...');
	  Logger.log('User', 'ExportToCsv', `${this.props.assetIds.length}`);
	  const { exportAll, fields } = this.state;
	  const fieldNames = exportAll ? [] : fields.map((field) => (field.value ? field.name : null)).filter(Boolean);

	  try {
	    const csv = await assetsApi.exportCSV(this.props.assetIds, fieldNames);
	    const blob = new Blob([csv], { type: 'text/csv' });
	    saveFile(blob, EXPORT_TO_CSV_DIALOG.fileName);
	  } catch (err) {
	    const errorMessage = utils.getDataFromResponceError(err, 'msg');
	    const errorStatus = utils.getDataFromResponceError(err, 'status');
	    switch (errorStatus) {
	    case 403: {
	      /** no permissions */
	      Toast(errorMessage || EXPORT_TO_CSV_DIALOG.noPermissions, {
	        autoClose: false,
	      });
	      break;
	    }
	    case 400: {
	      /** validation error */
	      Toast(EXPORT_TO_CSV_DIALOG.validationError + (errorMessage ? `: ${errorMessage}` : ''), {
	        autoClose: false,
	      });
	      break;
	    }
	    default: {
	      Logger.error(new Error('Can not export to csv'), { error: err, showDialog: true }, [
	        'ExportToCsvFailed',
	        (err && err.message) || 'NoMessage',
	      ]);
	    }
	    }
	  }
	  this.props.destroy();
	  UiBlocker.unblock();
	};

	setExportAll = () => this.setState({ exportAll: true });

	unsetExportAll = () => this.setState({ exportAll: false });

	handleCheckboxChange = (index, value) => {
	  const fields = [...this.state.fields];
	  fields[index] = { ...fields[index], value };
	  this.setState({ fields });
	};

	render() {
	  const { props, state } = this;
	  return (
	    <div className="simpleDialog exportDialog">
	      <div className="simpleDialogUnderlayer" />
	      <div className="simpleDialogBox">
	        <div className="simpleDialogHeader">
	          <span className="simpleDialogTitle">{props.title}</span>
	          <span className="simpleDialogBtnCross" onClick={this.cancel}>
	            <Icon name="close" />
  </span>
  </div>
	        <div className="simpleDialogContent">
	          <div className="simpleDialogContentInner">
	            <div className="simpleDialogDescription">
	              <p>Export {props.assetIds.length} selected asset(s) as CSV. Include required asset metadata.</p>
	              <div className="exportDialog-radios">
	                <div className="exportDialog-row">
	                  <Radio
	                    value={state.exportAll}
	                    label={EXPORT_TO_CSV_DIALOG.exportAllFields}
	                    onChange={this.setExportAll}
  />
  </div>
	                <div className={cn('exportDialog-row', { 'exportDialog-row-expanded': !state.exportAll })}>
	                  <Radio
	                    value={!state.exportAll}
	                    label={EXPORT_TO_CSV_DIALOG.exportSelectedFields}
	                    onChange={this.unsetExportAll}
  />
	                  {!state.exportAll && (
  <ul className="exportDialog-checkboxes">
	                      {state.fields.map((field, index) => (
	                        <li key={field.name}>
	                          <Checkbox
	                            label={field.title}
	                            value={field.value}
	                            onChange={(value) => this.handleCheckboxChange(index, value)}
  />
  </li>
	                      ))}
	                    </ul>
	                  )}
  </div>
  </div>
  </div>
  </div>
  </div>
	        <div className="simpleDialogFooter">
	          <span className="simpleDialogFooterBtn simpleDialogFooterBtnCancel" onClick={this.cancel}>
	            {props.textBtnCancel}
  </span>
	          <span className="simpleDialogFooterBtn" onClick={this.submit}>
	            {props.textBtnOk}
  </span>
  </div>
  </div>
  </div>
	  );
	}
}

export default ExportCsvDialog;
