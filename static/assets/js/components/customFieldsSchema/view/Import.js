import React from 'react';
import { func } from 'prop-types';
import cn from 'classnames';
import outy from 'outy';
import localization from '../../../shared/strings';
import { InputFile } from '../../../UIComponents';
import ToolbarButton from '../../toolbars/Button';
import Icon from '../../Icon';

class Import extends React.Component {
  /** PropTypes */
  static propTypes = {
    submit: func.isRequired,
  };

  /** State */
  state = {
    isDropVisible: false,
    fileName: '',
    submitCount: 0,
  };

  toggleDropDown = () => {
    this.setState({ isDropVisible: !this.state.isDropVisible }, () => {
      if (this.state.isDropVisible) {
        this.outsideClick = outy(this.$drop, ['click'], this.handleOutsideClick);
      } else {
        this.outsideClick.remove();
      }
    });
  };

  handleOutsideClick = () => {
    this.outsideClick.remove();
    this.setState({ isDropVisible: false });
  };

  handleFileChange = (event) => {
    const { files } = event.target;
    const fileName = files[0] && files[0].name;

    if (fileName) this.setState({ fileName });
  };

  submit = () => {
    const file = this.$input.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('schema', file);

    this.props.submit(data);
    this.setState({
      submitCount: this.state.submitCount + 1,
      fileName: '',
    });
    this.handleOutsideClick();
  };

  refInputFile = (node) => (this.$input = node);

  refDrop = (node) => (this.$drop = node);

  render() {
    const { state } = this;
    return (
      <div className="importWrapper">
        <ToolbarButton
          id="button-importSchema"
          onClick={this.toggleDropDown}
          tooltip={localization.CUSTOMFIELDSSCHEMA.btnImport}
          tooltipPosition="bottom"
        >
          <Icon name="import" />
        </ToolbarButton>
        <div className={cn('schemaUploadForm', { active: state.isDropVisible })} ref={this.refDrop}>
          <p>{localization.CUSTOMFIELDSSCHEMA.uploadText}</p>
          <InputFile
            name="CustomFieldsSchema.picsioconf"
            accept=".picsioconf"
            customRef={this.refInputFile}
            resetCount={state.submitCount}
            onChange={this.handleFileChange}
          />
          {state.fileName && (
            <div className="schemaUploadFormButton">
              <input
                type="button"
                className="picsioDefBtn btnCallToAction"
                value={localization.CUSTOMFIELDSSCHEMA.btnSubmit}
                onClick={this.submit}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Import;
