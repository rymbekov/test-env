import React from 'react';

import {
  Input, ImagePicker, Checkbox, ColorPicker,
} from '../../../UIComponents';
import { DatePicker } from '@picsio/ui';
import dayjs from 'dayjs';

import cn from 'classnames';
import Skeleton from 'react-loading-skeleton';
import { DropdownTreeWithStore } from '../../DropdownTree';
import DropdownTreeOpener from '../../DropdownTreeOpener';
import ua from '../../../ua';
import { datePickerPlaceholderWithTime, datePickerDateFormat, datePickerTimeFormat } from '../../../shared/dateLocale';
import SortOrder from '../../Sort';
import WithSkeletonTheme from '../../WithSkeletonTheme';

import localization from '../../../shared/strings';
import ErrorBoundary from '../../ErrorBoundary';

import * as collectionsApi from '../../../api/collections';
import Tag from '../../Tag';
import { findCollection } from '../../../store/helpers/collections';
import customizationConfig from '../configs/customizationConfig';
import proofingCustomizationConfig from '../configs/proofingCustomizationConfig';
import UpgradePlan from '../../UpgradePlan';

class WebsitesCustomization extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  state = {
    isDropdownTreeOpened: false,
    homeCollection: null,
  };

  async componentDidMount() {
    const { homeCollectionId } = this.props.website;
    if (homeCollectionId) {
      let homeCollection = findCollection(this.props.collectionsStore, 'my', {
        _id: homeCollectionId,
      });
      if (!homeCollection) {
        homeCollection = await collectionsApi.getCollection(homeCollectionId);
      }
      if (homeCollection) {
        this.setState({ homeCollection });
      }
    }
  }

  renderExpiresField = () => {
    const { handlers, website } = this.props;
    let expiresDate;
    if (!this.isMobile) {
      expiresDate = website.expiresAt && new Date(website.expiresAt);
    } else {
      expiresDate = website.expiresAt && dayjs(website.expiresAt).format('YYYY-MM-DD');
    }

    return (
      <div className="expiresField">
        <div className="expiresFieldTitle">{localization.WEBSITES.titleExpires}</div>
        <DatePicker
          selected={expiresDate}
          datePickerPlaceholder={datePickerPlaceholderWithTime}
          onChange={handlers.onChangeSiteExpires}
          showTimeSelect
          datePickerTimeFormat={datePickerTimeFormat}
          datePickerDateFormat={`${datePickerDateFormat} ${datePickerTimeFormat}`}
          timeCaption="time"
          minDate={new Date()}
        />
      </div>
    );
  };

  toggleDropdownTree = () => {
    this.setState({ isDropdownTreeOpened: !this.state.isDropdownTreeOpened });
  };

  handleChangeSort = (name, order) => {
    this.props.handlers.onChangeWebsiteData('sortType', { type: name, order });
  };

  handleChangeCollectionsSort = (name, order) => {
    this.props.handlers.onChangeWebsiteData('subcollectionsSortType', { type: name, order });
  };

  handleToggleCollection = (collection) => {
    this.props.handlers.onChangeWebsiteData('homeCollectionId', collection._id);
    this.setState({ homeCollection: collection });
  };

  renderSortOrder = () => {
    const { collection, website } = this.props;
    const id = collection._id;
    const sortType = website.sortType || collection.sortType;
    const subcollectionsSortType = website.subcollectionsSortType || collection.subcollectionsSortType;
    const { homeCollection } = this.state;
    const dropdownCheckedItems = homeCollection ? [homeCollection] : [];
    const isProofingTemplate = website.template === 'default';

    return (
      <>
        <div className="sortFields">
          <div className="sortField">
            <div className="sortFieldTitle">{localization.WEBSITES.titleSort}</div>
            <SortOrder view="select" id={id} sortType={sortType} changeSort={this.handleChangeSort} />
          </div>

          {!isProofingTemplate && (
            <div className="sortField">
              <div className="sortFieldTitle">{localization.WEBSITES.titleCollectionSort}</div>
              <SortOrder
                view="select"
                id={id}
                collectionSort
                subcollectionsSortType={subcollectionsSortType}
                changeSort={this.handleChangeCollectionsSort}
              />
            </div>
          )}
        </div>

        {!isProofingTemplate && (
          <>
            <div className="sortFieldTitle">{localization.WEBSITES.titleHomeScreen}</div>
            <div
              className={cn('collectionsList collectionsListSimple', { collectionsListWithCollection: homeCollection })}
            >
              {website.homeCollectionId && !homeCollection && (
                <WithSkeletonTheme>
                  <Skeleton width={120} height={20} />
                </WithSkeletonTheme>
              )}
              {homeCollection && <Tag className="tagLong act" type="collection" text={homeCollection.name} />}
              <DropdownTreeOpener
                hideOnClickOutside
                tooltip={localization.OPEN_COLLECTIONS_DIALOG}
                toggleDropdownTree={this.toggleDropdownTree}
              >
                <DropdownTreeWithStore
                  disableRoot
                  rootCollectionId={this.props.collectionId}
                  checkedItems={dropdownCheckedItems}
                  onClick={this.handleToggleCollection}
                  iconSpecial="folder"
                  usePermissions={false}
                />
              </DropdownTreeOpener>
              <span className="collectionsListDescription">{localization.WEBSITES.homeScreenCollection}</span>
            </div>
          </>
        )}
      </>
    );
  };

  handleColorChangeComplete = (color) => {
    this.props.handlers.onChangeWebsiteData('baseColor', color);
  };

  renderProofingCustomization() {
    const { handlers, website, imageData } = this.props;
    const checkboxes = proofingCustomizationConfig.checkboxes.map(this.renderCheckboxes);
    const imagePickers = proofingCustomizationConfig.imagePickers.map((item) => (
      <ImagePicker
        title={item.title}
        key={item.id}
        btnText={item.btnTitle}
        icon={item.icon}
        description={item.description}
        value={(imageData[item.id] && imageData[item.id].base64) || website[item.id]}
        onChange={(file) => handlers.onChangeImagePicker(file, item.id)}
        onRemove={() => handlers.onChangeImagePicker(null, item.id)}
        accept="image/jpg,image/jpeg,image/png,image/gif"
        maxFileSize={item.IMAGE_SIZE_LIMIT}
        showSpinner={this.props[`is${item.id}Uploading`]}
      />
    ));

    return (
      <div className="pageTabsContent__customization__proofing">
        <div className="pageItemTitle">{localization.WEBSITES.titleCustomization}</div>
        <div className="website-customization">
          <div className="website-customization-photo">{imagePickers}</div>
          <div className="website-customization-fields">
            {this.renderExpiresField()}
            {this.renderSortOrder()}
            {checkboxes}
          </div>
        </div>
      </div>
    );
  }

  renderCustomization() {
    const {
      handlers, website, originalWebsiteData, imageData, templates,
    } = this.props;
    let color;
    if (originalWebsiteData.template === website.template) {
      color = website.baseColor || templates.find((n) => n.key === website.template).baseColor;
    } else {
      color = templates.find((n) => n.key === website.template).baseColor;
    }

    return (
      <div className="pageWebsites__inputsBlock">
        <div className="website-customization">
          <div className="website-customization-photo">
            {customizationConfig.imagePickers.map((item) => (
              <ImagePicker
                title={item.title}
                key={item.id}
                btnText={item.btnTitle}
                icon={item.icon}
                description={item.description}
                value={(imageData[item.id] && imageData[item.id].base64) || website[item.id]}
                onChange={(file) => handlers.onChangeImagePicker(file, item.id)}
                onRemove={() => handlers.onChangeImagePicker(null, item.id)}
                accept="image/jpg,image/jpeg,image/png,image/gif"
                maxFileSize={item.IMAGE_SIZE_LIMIT}
                showSpinner={this.props[`is${item.id}Uploading`]}
              />
            ))}
          </div>
          <div className="website-customization-fields">
            <div className="pageItemTitle">{localization.WEBSITES.textCustomization}</div>
            <div className="pageWebsites__inputsBlock__content">
              <Input
                placeholder="Name"
                label="Name"
                value={website.overridedDisplayName}
                onChange={handlers.onChangeSiteTitle}
                onBlur={handlers.onSaveSiteTitle}
              />
              <Input
                placeholder="Subtitle"
                label="Subtitle"
                value={decodeURIComponent(website.overridedTagname)}
                onChange={handlers.onChangeSiteSubtitle}
                onBlur={handlers.onSaveSiteSubtitle}
              />
            </div>
            <div className="wrapperChoosedColorGamma">
              <ColorPicker initialColor={color} onColorChangeComplete={this.handleColorChangeComplete} />
            </div>
            {this.renderExpiresField()}
            {this.renderSortOrder()}
            {customizationConfig.checkboxes.map(this.renderCheckboxes)}
            <div className="pageWebsites__block__socialBtns">
              <div className="pageWebsites__block__socialBtnsTitle">{localization.WEBSITES.titleSocialButtons}</div>
              <div
                className={`picsioDefBtn ${!website.sharingButtonsShow ? 'disable' : ''}`}
                onClick={() => {
                  handlers.onChangeWebsiteData('sharingButtonsShow', null);
                }}
              >
                {localization.WEBSITES.textDontShow}
              </div>
              <div
                className={`picsioDefBtn ${website.sharingButtonsShow === 'left' ? 'disable' : ''}`}
                onClick={() => {
                  handlers.onChangeWebsiteData('sharingButtonsShow', 'left');
                }}
              >
                {localization.WEBSITES.textLeft}
              </div>
              <div
                className={`picsioDefBtn ${website.sharingButtonsShow === 'right' ? 'disable' : ''}`}
                onClick={() => {
                  handlers.onChangeWebsiteData('sharingButtonsShow', 'right');
                }}
              >
                {localization.WEBSITES.textRight}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCheckboxes = (block) => {
    const { handlers, website, subscriptionFeatures } = this.props;
    return (
      <div className="pageWebsites__block__checkboxes" key={block.id}>
        <div className="pageWebsites__block__checkboxTitleHolder">
          <div className="pageWebsites__block__checkboxTitle">{block.title}</div>
          <If condition={block.change}>
            <span className="pageWebsites__block__checkboxChange">{localization.WEBSITES.textChange}</span>
          </If>
          <If condition={block.show}>
            <span className="pageWebsites__block__checkboxShow">{localization.WEBSITES.textShow}</span>
          </If>
        </div>
        {block.items.map((item) => {
          let isNotAllowed = false;
          if (item.dependentOn) {
            isNotAllowed = !subscriptionFeatures[[item.dependentOn]];
          }
          return (
            <div className="pageWebsites__block__checkbox" key={item.label}>
              <span className="pageWebsites__block__checkboxLabel">
                <Choose>
                  <When condition={isNotAllowed}>
                    {item.labelDisabled}{' '}
                    <UpgradePlan tooltip={localization.UPGRADE_PLAN.tooltipPlanLimitations} />
                  </When>
                  <Otherwise>
                    {item.label}
                  </Otherwise>
                </Choose>
              </span>
              <If condition={item.change}>
                <Checkbox
                  value={website[item.show] ? website[item.change] : website[item.show]}
                  disabled={!website[item.show] || isNotAllowed}
                  onChange={(value) => {
                    handlers.onChangeWebsiteData(item.change, value);
                  }}
                />
              </If>
              <If condition={item.show}>
                <Checkbox
                  value={website[item.show]}
                  disabled={isNotAllowed}
                  onChange={(value) => {
                    const data = [
                      {
                        key: item.show,
                        value,
                      },
                    ];
                    !value && item.change && data.push({ key: item.change, value });
                    handlers.onChangeWebsiteData(data);
                  }}
                />
              </If>
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    const { website } = this.props;

    return (
      <div className="pageTabsContent__customization">
        {website.template === 'default' ? this.renderProofingCustomization() : this.renderCustomization()}
      </div>
    );
  }
}

export default WebsitesCustomization;
