import React from 'react';
import {
  number, bool, string, array, func, object,
} from 'prop-types';
import remove from 'lodash.remove';
import uniqBy from 'lodash.uniqby';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';

import localization from '../../shared/strings';
import Logger from '../../services/Logger';

import KeywordsDropdown from '../keywordsDropdown';
import AssigneesDropdown from '../assigneesDropdown';
import { Textarea } from '../../UIComponents';

import CustomFieldsSelector from '../CustomFieldsSelector';
import ua from '../../ua';
import DetailsBlock from '../DetailsBlock';
import Description from '../details/view/Description';
import AssetMarks from '../details/view/AssetMarks';
import Tooltip from '../Tooltip';

import CustomField from '../Search/CustomField';

const isMobile = ua.browser.isNotDesktop();

const defaultPanelsState = {
  importCommentVisibility: true,
  importDescriptionVisibility: true,
  importKeywordsVisibility: true,
  importAssigneesVisibility: true,
  importAssetMarksVisibility: true,
  importCustomFieldsVisibility: true,
};

const panelNames = {
  comments: 'importCommentVisibility',
  titleAndDescription: 'importDescriptionVisibility',
  keywords: 'importKeywordsVisibility',
  assignees: 'importAssigneesVisibility',
  assetMarks: 'importAssetMarksVisibility',
  customFieldsRequired: 'importCustomFieldsVisibility',
};

function getImportPanelVisibility() {
  try {
    return {
      ...defaultPanelsState,
      ...JSON.parse(localStorage.getItem('picsio.importPanelVisibility')),
    } || defaultPanelsState;
  } catch (err) {
    return {};
  }
}

class AdditionalFields extends React.Component {
  $importAdditional = React.createRef();

  $commentBlock = React.createRef();

  $titleBlock = React.createRef();

  $keywordsBlock = React.createRef();

  $assignessBlock = React.createRef();

  $marksBlock = React.createRef();

  $customFieldsBlock = React.createRef();

  state = {
    importPanelVisibility: getImportPanelVisibility(),
  };

  static getDerivedStateFromProps(props, prevState) {
    if (props.errors) {
      // don't close panels after user fix errors
      const importPanelVisibility = { ...prevState.importPanelVisibility };
      for (let error in props.errors) {
        error = error[0].toUpperCase() + error.slice(1);
        const visibilityKeyName = `import${error}Visibility`;

        Object.keys(importPanelVisibility).forEach((key) => {
          if (key === visibilityKeyName) {
            importPanelVisibility[key] = true;
          }
        });
      }
      return {
        importPanelVisibility,
      };
    }
    return null;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedCustomFields.length !== this.props.selectedCustomFields.length) {
      if (this.$importAdditional) {
        this.handleChangeScroll();
      }
    }
    /** handle not filled required fields -> scroll to first block with error */
    if (prevProps.errors !== this.props.errors && _isEmpty(prevProps.errors) && !_isEmpty(this.props.errors)) {
      if (this.$importAdditional.current) {
        const {
          assetMarks,
          assignees,
          comment,
          description,
          keywords,
          requiredCustomFields,
          title,
        } = this.props.errors;
        const block = (() => {
          if (comment) return this.$commentBlock.current;
          if (title || description) return this.$titleBlock.current;
          if (keywords) return this.$keywordsBlock.current;
          if (assignees) return this.$assignessBlock.current;
          if (assetMarks) return this.$marksBlock.current;
          if (requiredCustomFields) return this.$customFieldsBlock.current;
          return null;
        })();

        if (block) {
          if (window.innerWidth < 1024) {
            const $importContent = document.querySelector('.importContent');
            if ($importContent) $importContent.scrollTop = block.offsetTop;
          } else {
            this.$importAdditional.current.scrollTop = block.offsetTop - 20;
          }
        }
      }
    }
  }

  handleChangeScroll = () => {
    this.$importAdditional.current.scrollTop = this.$importAdditional.current.scrollHeight;
  };

  /**
   * Keywords start
   * @param {(object|Array)} items
   * @returns {array}
   */
  selectKeyword = (items) => {
    let selectedKeywords = [];
    if (items.length) {
      selectedKeywords = [...this.props.selectedKeywords, ...items];
    } else {
      selectedKeywords = [...this.props.selectedKeywords, items];
    }
    selectedKeywords = uniqBy(selectedKeywords, '_id');
    const errors = { ...this.props.errors };
    delete errors.keywords;
    this.props.updateState({ selectedKeywords, errors });
  };

  deselectKeyword = (item) => {
    const selectedKeywords = [...this.props.selectedKeywords];
    remove(selectedKeywords, (keyword) => keyword._id === item._id);

    this.props.updateState({ selectedKeywords });
  };

  handleKeywordsBlur = () => {
    Logger.log('User', 'UploadPanelAttachKeywords', this.props.selectedKeywords.length);
  };
  /** Keywords end */

  /** Users start */
  selectUser = (item) => {
    const selectedUsers = [...this.props.selectedUsers];
    const newItem = { ...item };
    selectedUsers.push(newItem);
    const errors = { ...this.props.errors };
    delete errors.assignees;
    this.props.updateState({ selectedUsers, errors });
  };

  deselectUser = (item) => {
    const selectedUsers = [...this.props.selectedUsers];
    remove(selectedUsers, (user) => user._id === item._id);

    this.props.updateState({ selectedUsers });
  };

  handleUsersBlur = () => {
    Logger.log('User', 'UploadPanelAssignUsers', this.props.selectedUsers.length);
  };
  /** Users end */

  /** Comment start */
  handleCommentChange = (event) => {
    const comment = event.currentTarget.value;
    this.props.updateState({ comment });
  };

  handleCommentBlur = (event) => {
    const errors = { ...this.props.errors };
    const comment = event.currentTarget.value;
    if (errors.comment && comment) {
      delete errors.comment;
    }
    this.props.updateState({ comment, errors });
    Logger.log('User', 'UploadPanelAddComment');
  };
  /** Comment end */

  /**
   * Toggle sections visibility
   * @param {string} title
   */
  toggleVisibility = (title) => {
    const importPanelVisibility = { ...this.state.importPanelVisibility };

    importPanelVisibility[title] = !importPanelVisibility[title];
    localStorage.setItem('picsio.importPanelVisibility', JSON.stringify(importPanelVisibility));
    this.setState({ importPanelVisibility });
  };

  handleTitleChange = (id, title) => {
    const errors = { ...this.props.errors };
    delete errors.title;
    this.props.updateState({ title, errors });
  };

  handleDescriptionChange = (id, description) => {
    const errors = { ...this.props.errors };
    delete errors.description;
    this.props.updateState({ description, errors });
  };

  handleFlagChange = (id, flag) => {
    const errors = { ...this.props.errors };
    delete errors.flag;
    delete errors.assetMarks;
    this.props.updateState({ flag, errors });
  };

  handleColorChange = (id, color) => {
    const errors = { ...this.props.errors };
    delete errors.color;
    delete errors.assetMarks;
    this.props.updateState({ color, errors });
  };

  handleRatingChange = (id, rating) => {
    const errors = { ...this.props.errors };
    delete errors.rating;
    delete errors.assetMarks;
    this.props.updateState({ rating, errors });
  };

  onResizeTextrea = (value) => localStorage.setItem('picsio.importCommentHeight', value);

  checkIfFieldRequired = (name) => {
    const { requiredCustomFields } = this.props;
    const requiredField = this.props.requiredFields[name];
    const isRequired = name === 'customFieldsRequired'
      ? !_isEmpty(requiredCustomFields)
      : !!requiredField;

    return Boolean(isRequired);
  }

  checkIfNeedToOpenByDefault = (name) => {
    const { importPanelVisibility } = this.state;
    const ifFieldRequired = this.checkIfFieldRequired(name);

    if (importPanelVisibility[panelNames[name]] === undefined && ifFieldRequired) {
      return true;
    }

    return false;
  }

  renderRequiredIndicator = (name) => {
    const isRequired = this.checkIfFieldRequired(name);

    return (
      <Choose>
        <When condition={isRequired}>
          <Tooltip content="Required fields" placement="top">
            <span className="isRequiredIndicator">
              * {name === 'assetMarks' && <sup>{this.props.getRequiredAssetMarksNames()}</sup>}
            </span>
          </Tooltip>
        </When>
        <Otherwise>
          {null}
        </Otherwise>
      </Choose>
    );
  };

  elementHasFocus = (elementName) => Object.keys(this.props.errors)[0] === elementName;

  render() {
    const { props, state } = this;
    const { requiredCustomFields, isCommentsAllowed, isCustomFieldsAllowed } = props;
    const { errors } = props;
    const hiddenCustomFields = requiredCustomFields.map(({ title }) => title);
    const isRequiredCustomFieldsError = !_isEmpty(errors.requiredCustomFields);

    return (
      <div className="importAdditionalFields">
        <div className="importFieldsHolder" ref={this.$importAdditional}>
          {/* Comment to revision */}
          <DetailsBlock
            dataQa="comment"
            ref={this.$commentBlock}
            detailsPanelVisibility={state.importPanelVisibility}
            toggleVisibility={this.toggleVisibility}
            blockName="importCommentVisibility"
            blockTitle={isCommentsAllowed ? 'Comment revision' : 'Comment (read only)'}
            indicator={this.renderRequiredIndicator('comments')}
            error={Boolean(errors.comment)}
            errorHighlight
            openByDefault={this.checkIfNeedToOpenByDefault('comments')}
          >
            <div className="importFieldItem">
              <Textarea
                placeholder={localization.IMPORT.placeholderInputComment}
                value={props.comment}
                onChange={this.handleCommentChange}
                onBlur={this.handleCommentBlur}
                onResize={this.onResizeTextrea}
                height={localStorage.getItem('picsio.importCommentHeight')}
                disabled={props.disabled}
                error={errors.comment}
                autoFocus={!isMobile && this.elementHasFocus('comment')}
              />
            </div>
          </DetailsBlock>
          {/* Title and description  */}
          <DetailsBlock
            dataQa="description"
            ref={this.$titleBlock}
            detailsPanelVisibility={state.importPanelVisibility}
            toggleVisibility={this.toggleVisibility}
            blockName="importDescriptionVisibility"
            blockTitle={localization.DETAILS.textTitleAndDescription}
            indicator={this.renderRequiredIndicator('titleAndDescription')}
            error={Boolean(errors.title || errors.description)}
            errorHighlight
            openByDefault={this.checkIfNeedToOpenByDefault('titleAndDescription')}
          >
            <Description
              eventPrefix="UploadPanel"
              collection={[
                {
                  title: props.title,
                  description: props.description,
                },
              ]}
              selectedAssetsIds={['']}
              titleShow
              titleEditable={props.permissions.editAssetTitle}
              descriptionShow
              descriptionEditable={props.permissions.editAssetDescription}
              textareaHeightNameLS="picsio.importDescriptionHeight"
              changeTitle={this.handleTitleChange}
              changeDescription={this.handleDescriptionChange}
              disabled={props.disabled}
              titleError={errors.title}
              descriptionError={errors.description}
              autoFocus={!isMobile && this.elementHasFocus('title')}
            />
          </DetailsBlock>
          {/* Keywords dropdown */}
          <DetailsBlock
            dataQa="keywords"
            ref={this.$keywordsBlock}
            detailsPanelVisibility={state.importPanelVisibility}
            toggleVisibility={this.toggleVisibility}
            blockName="importKeywordsVisibility"
            blockTitle={localization.DETAILS.textKeywords}
            indicator={this.renderRequiredIndicator('keywords')}
            error={errors.keywords}
            errorHighlight
            openByDefault={this.checkIfNeedToOpenByDefault('keywords')}
          >
            <div className="importFieldItem">
              <KeywordsDropdown
                placeholder={localization.DROPDOWN.placeholderKeywords}
                placeholderIcon="emptyKeywords"
                icon="keyword"
                filterText={localization.DROPDOWN.chooseKeywords}
                createText={localization.DROPDOWN.createKeyword}
                createPlaceholderText={localization.DROPDOWN.placeholderKeywordsCreate}
                checkedItems={props.selectedKeywords}
                onCheckedHandler={this.selectKeyword}
                onUncheckedHandler={this.deselectKeyword}
                canCreate={props.isKeywordsActionsAllowed}
                onBlur={this.handleKeywordsBlur}
                isOnlyCreate
                readOnly={props.permissions.editAssetKeywords !== true || props.disabled}
                disabled={props.disabled}
                error={errors.keywords}
                autoFocus={!isMobile && this.elementHasFocus('keywords')}
              />
            </div>
          </DetailsBlock>
          {/* Users dropdown */}
          <DetailsBlock
            dataQa="assignees"
            ref={this.$assignessBlock}
            detailsPanelVisibility={state.importPanelVisibility}
            toggleVisibility={this.toggleVisibility}
            blockName="importAssigneesVisibility"
            blockTitle={localization.DETAILS.textAssignees}
            indicator={this.renderRequiredIndicator('assignees')}
            error={errors.assignees}
            errorHighlight
            openByDefault={this.checkIfNeedToOpenByDefault('assignees')}
          >
            <div className="importFieldItem">
              <AssigneesDropdown
                placeholder={localization.ASSING_USER.placeholder}
                icon="avatar"
                placeholderIcon="emptyAvatar"
                title={localization.ASSING_USER.title}
                filterText={localization.ASSING_USER.filterText}
                checkedItems={props.selectedUsers}
                onCheckedHandler={this.selectUser}
                onUncheckedHandler={this.deselectUser}
                onBlur={this.handleUsersBlur}
                disabled={props.disabled}
                readOnly={props.permissions.editAssetAssignees !== true}
                error={errors.assignees}
                autoFocus={!isMobile && this.elementHasFocus('assignees')}
              />
            </div>
          </DetailsBlock>
          {/* Asset Marks */}
          <DetailsBlock
            dataQa="assetMarks"
            ref={this.$marksBlock}
            detailsPanelVisibility={state.importPanelVisibility}
            toggleVisibility={this.toggleVisibility}
            blockName="importAssetMarksVisibility"
            blockTitle={localization.DETAILS.textAssetMarks}
            indicator={this.renderRequiredIndicator('assetMarks')}
            error={errors.assetMarks}
            errorHighlight
            openByDefault={this.checkIfNeedToOpenByDefault('assetMarks')}
          >
            <AssetMarks
              eventPrefix="UploadPanel"
              color={props.color}
              changeColor={this.handleColorChange}
              rating={props.rating}
              changeRating={this.handleRatingChange}
              flag={props.flag}
              changeFlag={this.handleFlagChange}
              flagShow
              flagEditable={props.permissions.editAssetMarks}
              colorShow
              colorEditable={props.permissions.editAssetMarks}
              ratingShow
              ratingEditable={props.permissions.editAssetMarks}
              selectedAssets={['']}
              highlight={[]}
              disabled={props.disabled}
              flagError={errors.flag}
              colorError={errors.color}
              ratingError={errors.rating}
            />
          </DetailsBlock>
          {/* Custom fields */}
          <DetailsBlock
            dataQa="customFields"
            ref={this.$customFieldsBlock}
            detailsPanelVisibility={state.importPanelVisibility}
            toggleVisibility={this.toggleVisibility}
            blockName="importCustomFieldsVisibility"
            blockTitle="Custom fields"
            indicator={this.renderRequiredIndicator('customFieldsRequired')}
            error={isRequiredCustomFieldsError && localization.IMPORT.textFieldIsRequired}
            errorHighlight
            openByDefault={this.checkIfNeedToOpenByDefault('customFieldsRequired')}
          >
            {/* Custom fields */}
            <div key="required" className="itemsCustomFieldedAs">
              {requiredCustomFields.map((field) => {
                const { title } = field;
                const error = _get(errors.requiredCustomFields, title, null);

                return (
                  <CustomField
                    key={title}
                    {...field}
                    onChange={props.onChangeRequiredCustomField}
                    disabled={props.disabled}
                    position={props.position}
                    error={error}
                    required
                  />
                );
              })}
            </div>
            <div key="selected" className="itemsCustomFieldedAs">
              {props.selectedCustomFields.map((field) => {
                const { title } = field;

                return (
                  <CustomField
                    key={title}
                    {...field}
                    position={props.position}
                    onChange={props.onChangeCustomField}
                    onRemove={props.deselectCustomField}
                    disabled={props.disabled}
                  />
                );
              })}
            </div>
            {/* Custom fields add */}
            <CustomFieldsSelector
              className="importCustomFields"
              selectedFields={props.selectedCustomFields}
              addField={props.selectCustomField}
              removeField={props.deselectCustomField}
              readOnly={props.permissions.editAssetMetadata !== true}
              disabled={props.disabled || !isCustomFieldsAllowed}
              hideDisabled
              disablePortal={window.innerWidth > 1024}
              hiddenFields={hiddenCustomFields}
            />
          </DetailsBlock>
        </div>
      </div>
    );
  }
}

AdditionalFields.defaultProps = {
  errors: {},
};
AdditionalFields.propTypes = {
  requiredFields: object,
  disabled: bool,
  selectKeywords: array,
  selectedUsers: array,
  comment: string,
  clearItems: func,
  updateState: func,
  errors: object,
  title: string,
  description: string,
  rating: number,
  flag: string,
  color: string,
};

export default AdditionalFields;
