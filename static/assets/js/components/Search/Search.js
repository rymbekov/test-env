import React from 'react';
import cn from 'classnames';

import { CSSTransition } from 'react-transition-group';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import uniqBy from 'lodash.uniqby';
import { Search as SearchIcon, Close } from '@picsio/ui/dist/icons';
import { Icon as UiIcon } from '@picsio/ui';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';

/** Store */
import * as actions from '../../store/actions/savedSearches';
import * as mainActions from '../../store/actions/main';
import { checkUserAccess } from '../../store/helpers/user';

import {
  Autocomplete, InputDateRange, Flags, Colors, StarRating, Checkbox,
} from '../../UIComponents';
import CustomFieldsSelector from '../CustomFieldsSelector';
import Icon from '../Icon';
import picsioConfig from '../../../../../config';

import AutocompleteNew from './Autocomplete';
import SearchIn from './SearchIn';
import Types from './Types';
import Keywords from './Keywords';
import CustomField from './CustomField';
import SimpleItem from './SimpleItem';
import Counter from './Counter';
import { setSearchRoute, isRouteFiltering, getSearchProps } from '../../helpers/history';
import { activeCollectionSelector } from '../../store/selectors/collections';
import { showDialog, showErrorDialog } from '../dialog';

const booleanSearchOperators = [' OR ', ' AND ', ' NOT '];

const makeDefaultState = (showArchived = false) => ({
  isOpened: false,
  isSearchSubmited: false,
  searchValue: '',
  searchIn: ['any'],
  type: 'any',
  uploadDate: 'any',
  updateDate: 'any',
  flags: [],
  colors: [],
  rating: 0,
  selectedKeywords: [],
  selectedCustomFields: [],
  showRestricted: true,
  showArchived,
  searchSource: null,
});

class Search extends React.Component {
  state = makeDefaultState();

  getHideConfig = () => {
    if (this._hide) return this._hide;

    const isProofing = picsioConfig.isProofing();

    this._hide = {
      keywords: isProofing,
      flags: isProofing && picsioConfig.access && !picsioConfig.access.flagShow,
      colors: isProofing && picsioConfig.access && !picsioConfig.access.colorShow,
      rating: isProofing && picsioConfig.access && !picsioConfig.access.ratingShow,
      btnSaveThisSearch: isProofing,
      customFieldsAdd: isProofing || !this.props.isCustomFieldsAllowed,
    };

    return this._hide;
  };

  componentDidMount() {
    this.onRouteSearch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location !== this.props.location) {
      this.onRouteSearch();
    }
  }

  getSearchPlaceholder = () => {
    let placeholder = 'Search all collections';
    const {
      tagId, lightboardId, inboxId, archived,
    } = this.props.location.query;
    if (tagId || archived) {
      const { activeCollection } = this.props;
      if (activeCollection?.name && activeCollection?.name !== this.props.rootCollectionName) {
        placeholder = `Search in '${utils.decodeSlash(activeCollection.name)}'`;
      }
    } else if (lightboardId) {
      const { activeLightboard } = this.props;
      if (activeLightboard?.path) {
        const name = activeLightboard.path.split('→').pop();
        placeholder = `Search in '${decodeURIComponent(name)}'`;
      }
    } else if (inboxId) {
      const inbox = this.props.inboxes.find((item) => item._id === inboxId) || {};
      if (inbox?.name) {
        const { name } = inbox;
        placeholder = `Search in '${decodeURIComponent(name)}'`;
      }
    }
    return placeholder;
  }

  onRouteSearch = () => {
    const searchProps = getSearchProps();
    this.searchTagId = searchProps.tagId;
    this.searchLightboardId = searchProps.lightboardId;
    const isSearchSubmited = isRouteFiltering();

    if (this.internalSubmit) {
      this.internalSubmit = false;
      this.setState({ isSearchSubmited });
      return;
    }

    const newState = makeDefaultState();
    newState.isSearchSubmited = isSearchSubmited;

    if (searchProps.searchIn) {
      newState.searchIn = [...searchProps.searchIn];
    }
    if (searchProps.color) newState.colors = [...searchProps.color];
    if (searchProps.flag) newState.flags = [...searchProps.flag];
    if (searchProps.createdAt) newState.uploadDate = searchProps.createdAt;
    if (searchProps.updatedAt) newState.updateDate = searchProps.updatedAt;
    if (searchProps.rating) newState.rating = searchProps.rating;
    if (searchProps.text) newState.searchValue = searchProps.text;
    if (searchProps.type) newState.type = searchProps.type;
    if (searchProps.hideRestricted) newState.showRestricted = false;
    if (
      (searchProps.showArchived || searchProps.archived)
      && this.props.rolePermissions.viewArchive
    ) { newState.showArchived = true; }
    if (searchProps.archived) {
      newState.showArchivedDisabled = true;
    } else {
      newState.showArchivedDisabled = false;
    }

    if (searchProps.keywords) {
      searchProps.keywords.forEach((id) => {
        const keyword = this.props.allKeywords.find((kw) => kw._id === id);
        if (keyword) {
          const item = {
            _id: keyword._id,
            title: keyword.path.split('→').pop().toLowerCase(),
          };
          newState.selectedKeywords.push(item);
        }
      });
    }

    if (searchProps.searchSource) {
      newState.searchSource = searchProps.searchSource;
    }

    // if meta fields in search props
    if (Object.keys(searchProps).some((item) => item.indexOf('meta') === 0)) {
      const metaFields = Object.keys(searchProps).filter((item) => item.indexOf('meta') === 0);
      metaFields.forEach((field) => {
        const model = this.props.allCustomFields.find(
          (customField) => customField.title === field.substr(5),
        );
        const item = {
          title: model.title,
          value: searchProps[field],
          type: model.type,
          _id: model.title,
          order: model.order,
          options: model.options,
          multiple: model.multiple,
        };
        if (item.type === 'boolean') {
          item.value = item.value === 'true';
        }
        if (item.options && !item.multiple) {
          item.value = item.options.findIndex(
            (option) => option.toLowerCase() === item.value.toLowerCase(),
          );
        }
        newState.selectedCustomFields.push(item);
      });
    }
    this.setState(newState);
  };

  makeSearchRoute = () => {
    const {
      searchValue,
      searchIn,
      type,
      uploadDate,
      updateDate,
      flags,
      colors,
      rating,
      selectedKeywords,
      selectedCustomFields,
      showRestricted,
      showArchived,
      searchSource,
    } = this.state;
    const { trashed, archived } = getSearchProps();
    const result = { trashed, archived };

    if (this.searchTagId) result.tagId = this.searchTagId;
    if (this.searchLightboardId) result.lightboardId = this.searchLightboardId;
    if (!searchIn.some((value) => value === 'any')) result.searchIn = [...searchIn];
    if (colors.length > 0) result.color = [...colors];
    if (flags.length > 0) result.flag = [...flags];
    if (uploadDate !== 'any') result.createdAt = uploadDate;
    if (updateDate !== 'any') result.updatedAt = updateDate;
    if (rating) result.rating = rating;
    if (searchValue) result.text = searchValue;
    if (type !== 'any') result.type = type;
    if (searchSource) result.searchSource = searchSource;

    if (selectedKeywords.length > 0) {
      result.keywords = selectedKeywords.map((keyword) => keyword._id);
    }

    if (selectedCustomFields.length > 0) {
      selectedCustomFields.forEach((customField) => {
        if (customField.options) {
          if (customField.multiple) {
            if (customField.value.length) {
              result[`meta.${customField.title}`] = customField.value;
            }
          } else {
            result[`meta.${customField.title}`] = customField.options[customField.value];
          }
        } else {
          result[`meta.${customField.title}`] = customField.value;
        }
      });
    }

    if (!showRestricted) result.hideRestricted = true;
    if (showArchived && !archived) result.showArchived = true;

    return result;
  };

  setSearchValue = (searchValue) => this.setState({ searchValue });

  resetSearchValue = () => {
    this.setState({ searchValue: '' }, () => this.submit(true));
    Logger.log('User', 'SearchClear');
  };

  submitSearchValue = (searchValue) => {
    this.setState({ searchValue }, this.submit);
    Logger.log('User', 'Search', { text: searchValue });
    const booleanSearchOperatorsInUse = new Set();
    booleanSearchOperators.forEach((operator) => {
      if (searchValue.includes(operator)) {
        booleanSearchOperatorsInUse.add(operator);
      }
    });
    if (booleanSearchOperatorsInUse.size) {
      Logger.log('User', 'SearchWithBooleanOperators', {
        operators: Array.from(booleanSearchOperatorsInUse),
      });
    }
  };

  changeSearchIn = (searchIn) => {
    this.setState({ searchIn });
    Logger.log('User', 'SearchAdvancedSearchIn', { value: searchIn });
  };

  selectType = (type) => {
    this.setState({ type });
    Logger.log('User', 'SearchAdvancedSelectType', { type });
  };

  /**
   * Keywords start
   * @param {(object|Array)} items
   * @returns {array}
   */
  selectKeyword = (items) => {
    let selectedKeywords = [];
    if (items.length) {
      selectedKeywords = [...this.state.selectedKeywords, ...items];
    } else {
      selectedKeywords = [...this.state.selectedKeywords, items];
    }
    selectedKeywords = uniqBy(selectedKeywords, '_id');
    this.setState({ selectedKeywords });
    Logger.log('User', 'SearchAdvancedSelectKeywords', {
      value: selectedKeywords.map((kw) => kw.title),
    });
  };

  deselectKeyword = (item) => {
    const selectedKeywords = [...this.state.selectedKeywords];
    const itemIndex = selectedKeywords.findIndex((keyword) => keyword._id === item._id);

    if (itemIndex !== -1) {
      selectedKeywords.splice(itemIndex, 1);
      this.setState({ selectedKeywords });
      Logger.log('User', 'SearchAdvancedDeselectKeywords', {
        value: selectedKeywords.map((kw) => kw.title),
      });
    }
  };

  selectCustomField = (item) => {
    const { selectedCustomFields } = this.state;
    switch (item.type) {
    case 'enum':
      if (item.multiple) {
        item.value = '';
      } else {
        item.value = 0;
      }
      break;
    case 'int':
      item.value = 0;
      break;
    case 'input':
      item.value = '';
      break;
    case 'boolean':
      item.value = false;
      break;
    }
    selectedCustomFields.push(item);
    this.setState(
      { selectedCustomFields },
      () => (this.$filters.scrollTop = this.$filters.offsetHeight),
    );
    Logger.log('User', 'SearchAdvancedSelectCustomFields', {
      value: selectedCustomFields.map((item) => item.title),
    });
  };

  deselectCustomField = (item) => {
    const { selectedCustomFields } = this.state;
    const itemIndex = selectedCustomFields.findIndex((field) => field.title === item.title);

    if (itemIndex !== -1) {
      selectedCustomFields.splice(itemIndex, 1);
      this.setState({ selectedCustomFields: [...selectedCustomFields] });
      Logger.log('User', 'SearchAdvancedDeselectCustomFields', {
        value: selectedCustomFields.map((item) => item.title),
      });
    }
  };

  onChangeCustomField = (order, value, config) => {
    const { selectedCustomFields } = this.state;
    const selectedCustomField = selectedCustomFields.find((item) => item.order === order);
    if (selectedCustomField.multiple) {
      if (config?.isAttach) {
        selectedCustomField.value += `${value},`;
      } else {
        const values = selectedCustomField.value.split(',');
        const index = values.findIndex((item) => item === value);
        values.splice(index, 1);
        selectedCustomField.value = values.join(',');
      }
    } else {
      selectedCustomField.value = value;
    }
    this.setState({ selectedCustomField });
  };

  onChangeUploadDate = (uploadDate) => {
    this.setState({ uploadDate });
    Logger.log('User', 'SearchAdvancedUploadDate', { value: uploadDate });
  };

  onChangeUpdateDate = (updateDate) => {
    this.setState({ updateDate });
    Logger.log('User', 'SearchAdvancedLastChanged', { value: updateDate });
  };

  onChangeRestrictedShow = () => {
    const value = !this.state.showRestricted;
    this.setState({ showRestricted: value });
    Logger.log('User', 'SearchAdvancedRestricted', { value });
  };

  onChangeFlags = (value) => {
    const { flags } = this.state;
    const flagIndex = flags.indexOf(value);

    if (flagIndex > -1) {
      flags.splice(flagIndex, 1);
    } else {
      flags.push(value);
    }
    this.setState({ flags });
    Logger.log('User', 'SearchAdvancedFlags', { value: flags });
  };

  onChangeColors = (value) => {
    const { colors } = this.state;
    const colorIndex = colors.indexOf(value);

    if (colorIndex > -1) {
      colors.splice(colorIndex, 1);
    } else {
      colors.push(value);
    }

    this.setState({ colors });
    Logger.log('User', 'SearchAdvancedColors', { value: colors });
  };

  onChangeRating = (value) => {
    const rating = this.state.rating === value ? 0 : value;
    this.setState({ rating });
    Logger.log('User', 'SearchAdvancedRating', { value: rating });
  };

  toggleCheckbox = (name) => () => {
    const value = this.state[name];

    if (name === 'showArchived' && value) {
      Logger.log('User', 'SearchShowArchivedAssets');
    }
    this.setState({ [name]: !value });
    Logger.log('User', 'SearchAdvancedArchived', { value: !value });
  };

  setRoute = () => {
    const { isMobile, mainActions } = this.props;
    this.internalSubmit = true;

    // for submit or reset, when route not changed
    setTimeout(() => (this.internalSubmit = false), 200);
    setSearchRoute(this.makeSearchRoute());

    if (isMobile) {
      mainActions.setMobileAdditionalScreenPanel();
      mainActions.setMobileMainScreenPanel('catalog');
    }
  };

  submit = (isReset = false) => {
    this.setState({ isOpened: false, searchSource: isReset ? null : 'searchbar' }, this.setRoute);
  };

  save = () => {
    const { manageTeamSavedSearches } = this.props.rolePermissions;

    Logger.log('User', 'AdvancedSearchPanelCreateSavedSearch');
    const dialogConfig = {
      title: localization.SEARCH.dialogTitleCreateSearch,
      input: {
        label: localization.SEARCH.dialogCreateSearchLabel,
        value: this.state.searchValue,
      },
      onOk: (data) => {
        const savedSearchDuplicate = this.props.savedSearches.find(
          (ss) => ss.name.toLowerCase().trim() === data.input.toLowerCase().trim(),
        );

        if (savedSearchDuplicate) {
          Logger.log('UI', 'SavedSearchHaveAlreadyDialog');
          showDialog({
            title: localization.SEARCH.dialogTitleSearchHaveAlready,
            text: localization.SEARCH.dialogTextSearchHaveAlready,
            textBtnCancel: null,
          });
          return;
        }

        if (!data.input) {
          showErrorDialog(localization.SEARCH.dialogErrorNameEmpty);
          return;
        }
        this.props.actions.add(data.input, this.makeSearchRoute(), data.checkbox);
      },
    };
    if (manageTeamSavedSearches) {
      dialogConfig.checkbox = {
        value: true,
        label: localization.SEARCH.dialogCreateSearchLabelShare,
      };
    }
    showDialog(dialogConfig);
  };

  reset = () => {
    Logger.log('User', 'AdvancedSearchPanelReset');
    const { archived } = getSearchProps();
    this.setState(makeDefaultState(archived), this.setRoute);
  };

  getKeywordsTitleList = () => this.props.allKeywords.map((item) => item.path.split('→').pop());

  render() {
    const {
      isOpened,
      isSearchSubmited,
      searchValue,
      searchIn,
      type,
      flags,
      colors,
      rating,
      uploadDate,
      updateDate,
      selectedKeywords,
      selectedCustomFields,
      showRestricted,
      showArchived,
      showArchivedDisabled,
    } = this.state;
    // TODO: need to change default value
    const { isMobile, featureFlags } = this.props;
    const isAllowedSearchByArchive = checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'viewArchive');
    const placeholder = this.getSearchPlaceholder();

    const { autosuggest } = featureFlags;

    return (
      <div
        className={`wrapperSearch${isMobile || isOpened ? ' show' : ''}`}
        className={cn('wrapperSearch', {
          show: isMobile || isOpened,
          isProofingSearch: picsioConfig.isProofing(),
        })}
      >
        <If condition={!isMobile}>
          <div
            id="itemsearch"
            className="toolbarButton"
            onClick={() => {
              this.setState({ isOpened: !isOpened }), this.props.mainActions.closeImport();
            }}
            role="button"
          >
            <span className="btnSearch">
              <Icon
                name={cn({
                  search: !isSearchSubmited,
                  m_toolbarFilters: isSearchSubmited,
                })}
              />
            </span>
          </div>
        </If>

        <div id="searchView" className={cn({ show: isMobile || isOpened })}>
          <div className="searchHeader">
            <span
              className="btnSearch"
              style={{ display: searchValue.length > 0 ? 'none' : 'block' }}
            >
              <UiIcon size="xl" color="inherit">
                <SearchIcon />
              </UiIcon>
            </span>
            <span
              className="btnReset"
              onClick={this.resetSearchValue}
              style={{ display: searchValue.length > 0 ? 'block' : 'none' }}
            >
              <UiIcon size="xl" color="inherit">
                <Close />
              </UiIcon>
            </span>
            <Choose>
              <When condition={autosuggest}>
                <AutocompleteNew
                  placeholder={placeholder}
                  searchValue={searchValue}
                  handleChange={this.setSearchValue}
                  handleSubmit={this.submitSearchValue}
                />
              </When>
              <Otherwise>
                <Autocomplete
                  placeholder={placeholder}
                  className="inputSearch"
                  value={searchValue}
                  getItems={this.getKeywordsTitleList}
                  onChange={this.setSearchValue}
                  onSubmit={this.submitSearchValue}
                />
              </Otherwise>
            </Choose>
            <div
              className={cn('btnExtendedSearch', {
                active: isOpened || isSearchSubmited,
              })}
              onClick={() => {
                this.setState((state) => ({ isOpened: !state.isOpened }));
                const trackingValue = this.state.isOpened ? 'Hide' : 'Show';
                Logger.log('User', `AdvancedSearchPanel${trackingValue}`);
              }}
            >
              <Icon name="m_toolbarFilters" />
            </div>
            <Counter amount={this.props.totalAssets} />
          </div>
          <CSSTransition in={isMobile || isOpened} unmountOnExit timeout={300} classNames="fade">
            <div className="searchContent">
              {/* Filters */}
              <div className="searchFilters" ref={(node) => (this.$filters = node)}>
                <div className="searchBody">
                  {/* Search in */}
                  <SearchIn checkedItems={searchIn} onChange={this.changeSearchIn} />

                  <div className="itemSearchFilters itemSearchFilters--location" />

                  {/* Types */}
                  <Types
                    label={localization.SEARCH.text.Type}
                    value={type}
                    onChange={this.selectType}
                  />

                  {/* Upload date */}
                  <SimpleItem label={localization.SEARCH.text['Upload date']}>
                    <InputDateRange value={uploadDate} onChange={this.onChangeUploadDate} />
                  </SimpleItem>

                  {/* Last changed */}
                  <SimpleItem label={localization.SEARCH.text['Last changed']}>
                    <InputDateRange value={updateDate} onChange={this.onChangeUpdateDate} />
                  </SimpleItem>

                  {/* Keywords */}
                  {!this.getHideConfig().keywords && (
                    <Keywords
                      selectedKeywords={selectedKeywords}
                      addKeyword={this.selectKeyword}
                      removeKeyword={this.deselectKeyword}
                    />
                  )}

                  {/* Flags */}
                  {!this.getHideConfig().flags && (
                    <SimpleItem label={localization.SEARCH.text.Flag}>
                      <Flags value={flags} onChange={this.onChangeFlags} />
                    </SimpleItem>
                  )}

                  {/* Colors */}
                  {!this.getHideConfig().colors && (
                    <SimpleItem label={localization.SEARCH.text.Color}>
                      <Colors value={colors} onChange={this.onChangeColors} />
                    </SimpleItem>
                  )}

                  {/* Rating */}
                  {!this.getHideConfig().rating && (
                    <SimpleItem label={localization.SEARCH.text.Rating}>
                      <StarRating value={rating} onChange={this.onChangeRating} />
                    </SimpleItem>
                  )}

                  {/* Restricted */}
                  <SimpleItem>
                    <Checkbox
                      label={localization.SEARCH.text['Restricted show']}
                      value={showRestricted}
                      onChange={this.onChangeRestrictedShow}
                    />
                  </SimpleItem>

                  {/* Show Archived Assets */}
                  <If condition={isAllowedSearchByArchive}>
                    <SimpleItem>
                      <Checkbox
                        label={localization.SEARCH.text.showArchivedAssets}
                        value={showArchived}
                        onChange={this.toggleCheckbox('showArchived')}
                        disabled={showArchivedDisabled}
                      />
                    </SimpleItem>
                  </If>

                  {/* Custom fields */}
                  {selectedCustomFields.length > 0 && (
                    <div className="itemsCustomFieldedAs">
                      {selectedCustomFields.map((field) => (
                        <CustomField
                          key={field.title}
                          options={field.options}
                          title={field.title}
                          type={field.type}
                          order={field.order}
                          value={field.value}
                          multiple={field.multiple}
                          onChange={this.onChangeCustomField}
                          onRemove={this.deselectCustomField}
                          isInputDateRange
                          position="top"
                        />
                      ))}
                    </div>
                  )}

                  {/* Custom fields add */}
                  {!this.getHideConfig().customFieldsAdd && (
                    <CustomFieldsSelector
                      selectedFields={selectedCustomFields}
                      addField={this.selectCustomField}
                      removeField={this.deselectCustomField}
                      className="searchDropdownTop"
                    />
                  )}
                </div>
              </div>
              {/* Buttons */}
              <div className="searchBtns">
                <div
                  className="picsioDefBtn btnSearch btnCallToAction"
                  onClick={() => {
                    Logger.log('User', 'AdvancedSearchPanelConfirm');
                    this.submit();
                  }}
                >
                  {localization.SEARCH.text.Search}
                </div>
                {!this.getHideConfig().btnSaveThisSearch && (
                  <div className="picsioDefBtn btnSaveThisSearch" onClick={this.save}>
                    {localization.SEARCH.text['Save this search']}
                  </div>
                )}
                <div className="picsioDefBtn btnReset" onClick={this.reset}>
                  {localization.SEARCH.text.Reset}
                </div>
                <a
                  href="http://help.pics.io/pics-io-explained/search"
                  target="_blank"
                  className="btnHowItWorks picsioDefBtn picsioLink"
                >
                  {localization.SEARCH.text['Learn more']}
                </a>
              </div>
            </div>
          </CSSTransition>
        </div>
      </div>
    );
  }
}

const ConnectedSearch = connect(
  (state) => ({
    location: state.router.location,
    allKeywords: state.keywords.all,
    allCustomFields: state.customFields.items,
    totalAssets: state.assets.total,
    savedSearches: state.savedSearches.all,
    rolePermissions: (picsioConfig.isMainApp() && state.user.role.permissions) || {},
    featureFlags: (picsioConfig.isMainApp() && state.user.team.featureFlags) || {},
    rootCollectionName: state.collections.collections?.my?.name || '',
    activeCollection: activeCollectionSelector(state),
    activeLightboard: state.lightboards.activeLightboard,
    inboxes: state.inboxes.inboxes,
    isCustomFieldsAllowed: state.user.subscriptionFeatures?.customFields || false,
  }),
  (dispatch) => ({
    actions: bindActionCreators(actions, dispatch),
    mainActions: bindActionCreators(mainActions, dispatch),
  }),
)(Search);

export default ConnectedSearch;
