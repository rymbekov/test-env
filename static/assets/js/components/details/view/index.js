import React from 'react';
import {
  string, number, object, array, arrayOf,
} from 'prop-types';
import cn from 'classnames';
import union from 'lodash.union';
import uniqBy from 'lodash.uniqby';
import { Button } from '@picsio/ui';

import picsioConfig from '../../../../../../config';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import ua from '../../../ua';
import * as pathHelper from '../../../helpers/paths';
import * as Api from '../../../api/assets';
import Logger from '../../../services/Logger';

/** Components */
import store from '../../../store';
import { checkUserAccess } from '../../../store/helpers/user';
import UserAssign from './UserAssign';
import LinkedAssets from './LinkedAssets';
import DetailsBlock from '../../DetailsBlock';
import DetailsPanelHeader from './Header';
import Processing from './Processing';
import Description from './Description';
import Keywords from './Keywords';
import CollectionsComponent from './CollectionsComponent';
import Lightboards from './Lightboards';
import AssetMarks from './AssetMarks';
import Share from './Share';
import Restrict from './Restrict';
import RestrictedAsset from './RestrictedAsset';
import CustomFields from './CustomFields/index';
import Map from './Map';
import CollectionInfo from '../../CollectionInfo';
import ArchiveAssetTab from './ArchiveAssetTab';

import DetailsPanelConfig from './DetailsPanelEdit/DetailsPanelConfig';
import DetailsPanelEdit from './DetailsPanelEdit';
import Tooltip from '../../Tooltip';
import { showErrorDialog } from '../../dialog';
import Icon from '../../Icon';
import WatermarkAssetsTab from './WatermarkAssetsTab';

const defaultPanelsState = {
  detailsProcessingVisibility: true,
  detailsDescriptionVisibility: true,
  detailsKeywordsVisibility: true,
  detailsAssigneeVisibility: true,
  detailsLinkedAssetsVisibility: true,
  detailsCollectionsVisibility: true,
  detailsLightboardsVisibility: true,
  detailsMarksVisibility: true,
  detailsMapVisibility: true,
  detailsAssetShareVisibility: true,
  detailsAssetRestrictVisibility: true,
  detailsAssetArchiveVisibility: true,
  File: true,
  // XMP: true,
  // IPTS: true,
  // EXIF: true,
  // JFIF: true,
  // Other: true,
  GPS: true,
};

const isMainApp = picsioConfig.isMainApp();

function getDetailsPanelEditable() {
  try {
    return utils.LocalStorage.get('picsio.detailsPanelEditable') || {};
  } catch (err) {
    return {};
  }
}
function getDetailsPanelVisibility() {
  try {
    return {
      ...defaultPanelsState,
      ...JSON.parse(utils.getCookie('picsio.detailsPanelVisibility')),
    } || defaultPanelsState;
  } catch (err) {
    return {};
  }
}
const getDefaultState = () => {
  const detailsPanelEditable = getDetailsPanelEditable();
  return {
    assetsIds: [],
    assets: [],
    isBusy: false,
    rating: null,
    flag: null,
    color: null,
    keywords: [],
    tags: [],
    lightboards: [],
    assignees: [],
    detailsPanelVisibility: getDetailsPanelVisibility(),
    detailsPanelEditable,
    currentLock: detailsPanelEditable.lockAlways || null,
    detailsPanelLocked: detailsPanelEditable.lockAlways || false,
    filename: '',
    keywording: null,
    replicating: null,
    metadating: null,
    contenting: null,
    thumbnailing: null,
    keywordingReason: null,
    replicatingReason: null,
    metadatingReason: null,
    contentingReason: null,
    thumbnailingReason: null,
    keywordingErrorCode: null,
    replicatingErrorCode: null,
    metadatingErrorCode: null,
    contentingErrorCode: null,
    thumbnailingErrorCode: null,
    paramsForHighlight: [],
    permissions: {},
    watermarkId: null,
    isRestricted: false,
    restrictReason: null,
    restrictStartAt: null,
    restrictExpiresAt: null,
    modifiedMetaFields: {},
    isArchived: false,
    archivedByReason: 'Asset is moved to archive',
    isLocked: false,
  };
};

class Details extends React.Component {
  isMobile = ua.browser.isNotDesktop();

  state = getDefaultState();

  static getDerivedStateFromProps(props, nextState) {
    if (nextState.assetsIds !== props.assetsIds || nextState.assets !== props.assets) {
      /** if selected assets changed - recalculate state */
      let state = { assetsIds: props.assetsIds, assets: props.assets };
      if (props.assetsIds.length > props.assets.length && nextState.assetsIds.length !== 0) {
        /** skip to componentDidUpdate */
        return state;
      }
      if (props.assetsIds.length > 0 && props.assets?.length > 0) {
        const firstAsset = props.assets[0];

        let { flag } = firstAsset;
        let { color } = firstAsset;
        let { rating } = firstAsset;
        let { keywording } = firstAsset;
        let { replicating } = firstAsset;
        let { metadating } = firstAsset;
        let { contenting } = firstAsset;
        let { thumbnailing } = firstAsset;
        let { keywordingReason } = firstAsset;
        let { replicatingReason } = firstAsset;
        let { metadatingReason } = firstAsset;
        let { contentingReason } = firstAsset;
        let { thumbnailingReason } = firstAsset;
        let { keywordingErrorCode } = firstAsset;
        let { replicatingErrorCode } = firstAsset;
        let { metadatingErrorCode } = firstAsset;
        let { contentingErrorCode } = firstAsset;
        let { thumbnailingErrorCode } = firstAsset;
        let keywords = [];
        let { watermarkId } = firstAsset;
        let tags = [];
        let lightboards = [];
        const assignees = [];
        let isDownloadable = true;
        let { paramsForHighlight } = firstAsset;
        let isRestricted = utils.isAssetRestricted(firstAsset.restrictSettings) || false;
        let restrictStartAt = firstAsset.restrictSettings.startAt || null;
        let restrictExpiresAt = firstAsset.restrictSettings.expiresAt || null;
        let restrictStartAtPlaceholder = firstAsset.restrictSettings.startAt || null;
        let restrictExpiresAtPlaceholder = firstAsset.restrictSettings.expiresAt || null;
        let restrictReason = firstAsset.restrictSettings.reason || null;
        let modifiedMetaFields = prepareModifiedMetaFields(firstAsset.modifiedMetaFields);
        let { archived, archivedByReason } = firstAsset;
        const isRemoveForever = Boolean(firstAsset.inbox);
        props.assets.forEach((asset) => {
          if (asset.flag !== flag) flag = null;
          if (asset.color !== color) color = null;
          if (asset.rating !== rating) rating = null;
          if (asset.keywording !== keywording) keywording = null;
          if (asset.replicating !== replicating) replicating = null;
          if (asset.metadating !== metadating) metadating = null;
          if (asset.contenting !== contenting) contenting = null;
          if (asset.thumbnailing !== thumbnailing) thumbnailing = null;
          if (asset.keywordingReason !== keywordingReason) keywordingReason = null;
          if (asset.replicatingReason !== replicatingReason) replicatingReason = null;
          if (asset.metadatingReason !== metadatingReason) metadatingReason = null;
          if (asset.contentingReason !== contentingReason) contentingReason = null;
          if (asset.thumbnailingReason !== thumbnailingReason) thumbnailingReason = null;
          if (asset.keywordingErrorCode !== keywordingErrorCode) keywordingErrorCode = null;
          if (asset.replicatingErrorCode !== replicatingErrorCode) replicatingErrorCode = null;
          if (asset.metadatingErrorCode !== metadatingErrorCode) metadatingErrorCode = null;
          if (asset.contentingErrorCode !== contentingErrorCode) contentingErrorCode = null;
          if (asset.thumbnailingErrorCode !== thumbnailingErrorCode) thumbnailingErrorCode = null;

          // if one of assets is resticted, we set `isRestricted = true`
          if (utils.isAssetRestricted(asset.restrictSettings)) isRestricted = true;
          if (asset.restrictSettings.startAt && asset.restrictSettings.startAt !== restrictStartAt) { restrictStartAt = null; }
          if (
            asset.restrictSettings.expiresAt
            && asset.restrictSettings.expiresAt !== restrictExpiresAt
          ) { restrictExpiresAt = null; }
          if (asset.restrictSettings.startAt != restrictStartAtPlaceholder) { restrictStartAtPlaceholder = localization.DETAILS.placeholderMultipleSelection; }
          if (asset.restrictSettings.expiresAt != restrictExpiresAtPlaceholder) { restrictExpiresAtPlaceholder = localization.DETAILS.placeholderMultipleSelection; }

          if (
            utils.isAssetRestricted(asset.restrictSettings)
            && asset.restrictSettings.reason != restrictReason
          ) {
            restrictReason = localization.DETAILS.placeholderMultipleSelection;
          }

          if (asset.modifiedMetaFields && asset.modifiedMetaFields.length) {
            modifiedMetaFields = {
              ...modifiedMetaFields,
              ...prepareModifiedMetaFields(asset.modifiedMetaFields),
            };
          }

          /** paramsForHighlight */
          const AssetparamsForHighlight = asset.paramsForHighlight;
          if (paramsForHighlight) { paramsForHighlight = union(AssetparamsForHighlight, paramsForHighlight); }

          /** keywords */
          const assetKeywords = asset.keywords;
          if (assetKeywords) keywords = [...keywords, ...assetKeywords];

          /** watermarks */
          // if one of assets has watermark, we set `isWatermarked = true`
          const assetWatermark = asset.watermarkId;
          if (assetWatermark) watermarkId = assetWatermark;
          /** collections */
          const assetCollections = asset.tags;
          if (assetCollections) tags = [...tags, ...assetCollections];

          /** lightboards */
          const assetLightboards = asset.lightboards;
          if (assetLightboards) lightboards = [...lightboards, ...assetLightboards];

          /** assignees */
          const assetAssignees = asset.assignees;
          if (assetAssignees && assetAssignees.length > 0) {
            assetAssignees.forEach((assignee) => {
              if (!assignees.find((item) => item._id === assignee.assigneeId)) {
                assignees.push({ _id: assignee.assigneeId });
              }
            });
          }

          /** isDownloadable */
          const assetisIsDownloadable = asset.isDownloadable;
          if (assetisIsDownloadable === false) {
            isDownloadable = false;
          }

          if (!archived && asset.archived) {
            archived = true;
          }
          if (archived && archivedByReason !== asset.archivedByReason) {
            archivedByReason = localization.DETAILS.placeholderMultipleSelection;
          }
        });

        /** keywords */
        keywords = uniqBy(keywords, (keyword) => keyword._id);
        /** collections */
        tags = uniqBy(tags, (collection) => collection._id).map((collection) => ({
          ...collection,
          path: collection.path.startsWith('/root/')
            ? pathHelper.removeRoot(collection.path)
            : collection.path,
        }));
        /** lightboards */
        lightboards = uniqBy(lightboards, (lihgtboard) => lihgtboard._id).filter(
          (lightboard) => props.user._id === lightboard.userId,
        );

        // check if changed previewed file or not
        let currentLock;
        const detailsPanelEditable = getDetailsPanelEditable();
        if (props.assets.length === 1) {
          currentLock = state.filename === props.assets[0].name
            ? state.currentLock
            : detailsPanelEditable.lockAlways;
        } else {
          currentLock = state.filename === props.assets.length
            ? state.currentLock
            : detailsPanelEditable.lockAlways;
        }

        let mergedPermissions;
        if (isMainApp) {
          mergedPermissions = utils.mergePermissions(props.assets.map((n) => n.permissions));
        }

        const rolePermissions = (picsioConfig.isMainApp() && props.user.role.permissions) || {};
        let permissions = preparePermissions(
          { ...mergedPermissions, ...rolePermissions },
          archived,
        );

        /** if one or more assets trashed - disable all permissions */
        if (props.assets.some((asset) => asset.trashed)) {
          permissions = getNegativePermissions(permissions);
        }

        state = {
          ...state,
          color,
          rating,
          flag,
          keywords,
          tags,
          lightboards,
          keywording,
          replicating,
          metadating,
          contenting,
          watermarkId,
          thumbnailing,
          keywordingReason,
          replicatingReason,
          metadatingReason,
          contentingReason,
          thumbnailingReason,
          keywordingErrorCode,
          replicatingErrorCode,
          metadatingErrorCode,
          contentingErrorCode,
          thumbnailingErrorCode,
          currentLock,
          assignees,
          isDownloadable,
          paramsForHighlight,
          permissions,
          isRestricted,
          restrictReason,
          restrictStartAt,
          restrictExpiresAt,
          restrictStartAtPlaceholder,
          restrictExpiresAtPlaceholder,
          modifiedMetaFields,
          isRemoveForever,
          isArchived: archived,
          archivedByReason,
        };
      } else {
        state = { ...getDefaultState(), state };
      }
      return state;
    }
    return null;
  }

  componentDidMount() {
    if (this.state.isArchived) {
      this.toggleEditable('lockTemporary');
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { state, props } = this;

    if (
      prevProps.assetsIds.length !== props.assetsIds.length
      && props.assetsIds.length > props.assets.length
    ) {
      this.getAggregatedData();
    }

    if ((!prevState.isArchived && state.isArchived) || (state.isArchived && !state.currentLock)) {
      this.toggleEditable('lockTemporary');
    }
  }

  getAggregatedData = async () => {
    this.setState({ isBusy: true });
    try {
      const data = await Api.getAggregatedData(this.props.assetsIds);
      const rolePermissions = (picsioConfig.isMainApp() && this.props.user.role.permissions) || {};
      let permissions = preparePermissions(
        { ...data.permissions, ...rolePermissions },
        data.archived,
      );
      if (data.isSomeTrashed) permissions = getNegativePermissions(permissions);
      this.setState({
        isBusy: false,
        color: data.color,
        rating: data.rating,
        flag: data.flag,
        keywords: data.keywords,
        tags: data.tags
          .filter((n) => n.path !== '/')
          .map((n) => ({
            path: n.path.startsWith('/root/') ? n.path.replace(/\/root\//, '') : n.path,
            _id: n._id,
          })),
        lightboards: data.lightboards.filter(
          (lightboard) => this.props.user._id === lightboard.userId,
        ),
        keywording: data.keywording,
        replicating: data.replicating,
        metadating: data.metadating,
        contenting: data.contenting,
        thumbnailing: data.thumbnailing,
        keywordingReason: data.keywordingReason,
        replicatingReason: data.replicatingReason,
        metadatingReason: data.metadatingReason,
        contentingReason: data.contentingReason,
        thumbnailingReason: data.thumbnailingReason,
        keywordingErrorCode: data.keywordingErrorCode,
        replicatingErrorCode: data.replicatingErrorCode,
        metadatingErrorCode: data.metadatingErrorCode,
        contentingErrorCode: data.contentingErrorCode,
        thumbnailingErrorCode: data.thumbnailingErrorCode,
        assignees: uniqBy(
          data.assignees.map((item) => ({ _id: item.assigneeId })),
          '_id',
        ),
        isDownloadable: isMainApp && data.permissions.downloadFiles,
        permissions,
        isRestricted: data.isSomeRestricted,
        restrictReason: data.restrictReason,
        restrictStartAt: data.restrictStartAt,
        restrictExpiresAt: data.restrictExpiresAt,
        restrictStartAtPlaceholder:
          data.isSomeRestricted && !data.restrictStartAt
            ? localization.DETAILS.placeholderMultipleSelection
            : null,
        restrictExpiresAtPlaceholder:
          data.isSomeRestricted && !data.restrictExpiresAt
            ? localization.DETAILS.placeholderMultipleSelection
            : null,
        isArchived: data.archived,
        archivedByReason: data.archivedByReason,
      });
    } catch (error) {
      Logger.error(new Error('Can not get aggregatedData'), { error });
      showErrorDialog(localization.ERROR_GETTING_AGGREGATED_DATA);
      this.setState({ isBusy: false });
    }
  };

  toggleEditable = (parameter) => {
    const { detailsPanelEditable } = this.state;
    let { currentLock, filename } = this.state;

    switch (parameter) {
    case 'unlockAlways': {
      detailsPanelEditable.unlockAlways = true;
      detailsPanelEditable.unlockLogout = false;
      detailsPanelEditable.lockAlways = false;
      currentLock = false;
      break;
    }

    case 'unlockLogout': {
      detailsPanelEditable.unlockAlways = false;
      detailsPanelEditable.unlockLogout = true;
      detailsPanelEditable.lockAlways = false;
      currentLock = false;
      break;
    }

    case 'lockAlways': {
      detailsPanelEditable.unlockAlways = false;
      detailsPanelEditable.unlockLogout = false;
      detailsPanelEditable.lockAlways = true;
      currentLock = true;
      break;
    }

    case 'lockTemporary': {
      currentLock = true;
      break;
    }

    default: {
      detailsPanelEditable.locked = !detailsPanelEditable.locked;
      currentLock = !currentLock;
      break;
    }
    }

    if (this.props.assets.length < 2) {
      filename = this.props.assets[0].name;
    } else {
      filename = this.props.assets.length;
    }

    if (parameter !== 'lockTemporary') {
      utils.LocalStorage.set('picsio.detailsPanelEditable', detailsPanelEditable);
    }
    this.setState({ detailsPanelEditable: { ...detailsPanelEditable }, currentLock, filename });
  };

  /**
   * Toggle sections visibility
   * @param {string} title
   */
  toggleVisibility = (title) => {
    const detailsPanelVisibility = { ...this.state.detailsPanelVisibility };

    detailsPanelVisibility[title] = !detailsPanelVisibility[title];
    utils.setCookie('picsio.detailsPanelVisibility', JSON.stringify(detailsPanelVisibility));
    this.setState({ detailsPanelVisibility });
  };

  highlightAnimationReset = (type) => {
    const { props } = this;
    const asset = props.assets[0];
    props.actions.removeHighlight([asset._id], type);
    const { paramsForHighlight } = asset;
    if (paramsForHighlight.length === 0) {
      props.actions.resetHighlight(this.props.assetsIds);
    }
  };

  isProcessingVisible = () => {
    let isSomethingProcessing = false;
    const data = this.handleProcessingData();

    data.forEach((item) => {
      if (
        item.status === 'waiting'
        || item.status === 'running'
        || item.status === 'failed'
        || (['rejected', 'delayed'].includes(item.status) && item.errors && item.errors.length)
      ) {
        isSomethingProcessing = true;
      }
    });

    return isSomethingProcessing;
  };

  getProcessingIndicator = () => {
    let indicator = null;
    let tooltipText = '';
    const data = this.handleProcessingData();
    const processingItems = [];
    const warningItems = [];
    const errorItems = [];

    data.forEach((item) => {
      if (item.status === 'running' || item.status === 'waiting') processingItems.push(item.name);
      if (item.status === 'rejected' || item.status === 'delayed') warningItems.push(item.name);
      if (item.status === 'failed') errorItems.push(item.name);
    });

    const processNames = {
      keywording: 'keywords',
      metadating: 'metadata',
      thumbnailing: 'thumbnail',
      contenting: 'content',
      replicating: 'updates',
    };

    if (processingItems.length) {
      tooltipText = 'Processing: ';
      processingItems.forEach((item) => {
        tooltipText += `${processNames[item]}, `;
      });
    }

    if (warningItems.length) {
      const text = tooltipText.length ? '<br>Warnings: ' : 'Warnings: ';
      tooltipText += text;
      warningItems.forEach((item) => {
        tooltipText += `${processNames[item]}, `;
      });
    }

    if (errorItems.length) {
      const text = tooltipText.length ? '<br>Errors: ' : 'Errors: ';
      tooltipText += text;
      errorItems.forEach((item) => {
        tooltipText += `${processNames[item]}, `;
      });
    }

    // remove last ', '
    tooltipText = tooltipText.slice(0, -2);

    if (processingItems.length || warningItems.length || errorItems.length) {
      indicator = (
        <Tooltip content={tooltipText} placement="top">
          <span
            className={cn('processingIndicator', {
              indicator: processingItems.length && !warningItems.length && !errorItems.length,
            })}
          >
            {(() => {
              if (errorItems.length) return <Icon name="close" />;
              if (warningItems.length && !errorItems.length) return <Icon name="attention" />;
              return null;
            })()}
          </span>
        </Tooltip>
      );
    }

    return indicator;
  };

  handleProcessingData = () => {
    const { state } = this;

    const processingData = [
      {
        name: 'keywording',
        status: state.keywording,
        errors: state.keywordingReason,
        errorCode: state.keywordingErrorCode,
        icon: 'keyword',
      },
      {
        name: 'metadating',
        status: state.metadating,
        errors: state.metadatingReason,
        errorCode: state.metadatingErrorCode,
        icon: 'label',
      },
      {
        name: 'thumbnailing',
        status: state.thumbnailing,
        errors: state.thumbnailingReason,
        errorCode: state.thumbnailingErrorCode,
        icon: 'previewTitle',
      },
      {
        name: 'replicating',
        status: state.replicating,
        errors: state.replicatingReason,
        errorCode: state.replicatingErrorCode,
        icon: 'retry',
      },
      {
        name: 'contenting',
        status: state.contenting,
        errors: state.contentingReason,
        errorCode: state.contentingErrorCode,
        icon: 'content',
      },
    ];

    return processingData;
  };

  render() {
    const { state, props } = this;
    const teamRestrictReason = props.user.team && props.user.team.policies.restrictReason;
    let { assetSharing: assetSharingAllowed, customFields: customFieldsAllowed } = props.user.subscriptionFeatures || {};
    /** Allow customFields on Proofing and SAS */
    if (!isMainApp) customFieldsAllowed = true;
    const {
      user: { _id: userId },
    } = props;
    const isAllowedManageWatermarksToAssets = props.assets[0] && props.assets[0].permissions?.manageAssetWatermark;
    const canEditWatermarks = props.user?.role?.permissions?.manageWatermarks;
    const restrictReason = state.restrictReason || teamRestrictReason || localization.RESTRICT.RESTRICTED_REASON;
    const isMetadataEditable = !state.isRestricted || (state.isRestricted && state.permissions.restrictedMetadataEditable);
    const isAllowedManageArchive = checkUserAccess('subscriptions', 'archive')
      && checkUserAccess('permissions', 'manageArchive');
    const isAllowedLightboards = checkUserAccess('permissions', 'manageLightboards');
    return (
      <DetailsPanelConfig userId={props.user._id}>
        {({
          isOpen, fields, config, toggleEditPanel, setFields, updateConfig,
        }) => (
          <div
            className={cn('detailsPanel', { disabled: props.updateInProgress })}
            style={{ width: props.panelWidth }}
          >
            <div
              className="resizer"
              onMouseDown={(event) => props.mainActions.resizePanel(event, props.panelName)}
            />
            <Choose>
              <When condition={picsioConfig.isMainApp() && props.assets.length < 1}>
                <CollectionInfo />
              </When>
              <Otherwise>
                <>
                  <If condition={isMainApp}>
                    <DetailsPanelEdit
                      isOpen={isOpen}
                      fields={fields}
                      config={config}
                      toggleEditPanel={toggleEditPanel}
                      setFields={setFields}
                      updateConfig={updateConfig}
                    />
                  </If>

                  {/* Details Header */}
                  <DetailsPanelHeader
                    actions={props.actions}
                    isMainApp={isMainApp}
                    permissions={state.permissions}
                    collection={props.assets}
                    total={props.total}
                    selectedAssetsIds={props.assetsIds}
                    detailsPanelEditable={state.detailsPanelEditable}
                    currentLock={state.currentLock}
                    toggleEditable={this.toggleEditable}
                    selectAll={props.actions.selectAll}
                    deselectAll={props.actions.deselectAll}
                    deleteAll={
                      state.isRemoveForever ? props.actions.deleteAssets : props.actions.trashAssets
                    }
                    isDownloadable={state.isDownloadable}
                    isRestricted={state.isRestricted}
                    error={props.error}
                    isRemoveForever={state.isRemoveForever}
                    lockMenuDisabled={state.isArchived}
                    isArchived={state.isArchived}
                  />
                  <div className="detailsPanel__content" ref={(node) => (this.detailPanel = node)}>
                    <div className="detailsPanel__list">
                      {/* Restricted asset */}
                      {state.isRestricted && (
                        <RestrictedAsset
                          reason={
                            props.assets.length === 1
                              ? restrictReason
                              : localization.DETAILS.placeholderMultipleSelectionRestricted
                          }
                        />
                      )}
                      {/* Processing */}
                      {isMainApp && this.isProcessingVisible() && (
                        <DetailsBlock
                          dataQa="processing"
                          detailsPanelVisibility={state.detailsPanelVisibility}
                          toggleVisibility={this.toggleVisibility}
                          blockName="detailsProcessingVisibility"
                          blockTitle={localization.DETAILS.textProcessing}
                          indicator={this.getProcessingIndicator()}
                          additionalClass="detailsProcessingSection"
                        >
                          <Processing
                            data={this.handleProcessingData()}
                            ids={props.assetsIds}
                            reRunParsing={props.actions.reRunParsing}
                          />
                        </DetailsBlock>
                      )}

                      {fields.map(({ id, permission }) => {
                        const { hidden } = config;
                        const isHidden = hidden.includes(id) || (permission && !state.permissions[permission]);

                        if (isHidden) {
                          return null;
                        }
                        switch (id) {
                        case 'description':
                          return (
                            <DetailsBlock
                              key={id}
                              dataQa="description"
                              detailsPanelVisibility={state.detailsPanelVisibility}
                              toggleVisibility={this.toggleVisibility}
                              blockName="detailsDescriptionVisibility"
                              blockTitle={localization.DETAILS.textTitleAndDescription}
                            >
                              <Description
                                eventPrefix="InfoPanel"
                                collection={props.assets}
                                selectedAssetsIds={props.assetsIds}
                                titleShow={state.permissions.titleShow}
                                titleEditable={
                                  state.permissions.titleEditable && isMetadataEditable
                                }
                                descriptionShow={state.permissions.descriptionShow}
                                descriptionEditable={
                                  state.permissions.descriptionEditable && isMetadataEditable
                                }
                                textareaHeightNameLS={props.textareaHeightNameLS}
                                changeTitle={props.actions.changeTitle}
                                changeDescription={props.actions.changeDescription}
                                modifiedTitle={state.modifiedMetaFields.Title}
                                modifiedDescription={state.modifiedMetaFields.Description}
                                disabled={
                                  props.inProgress.title
                                    || props.inProgress.description
                                    || state.currentLock
                                }
                              />
                            </DetailsBlock>
                          );
                        case 'keywords':
                          return (
                            <Keywords
                              key={id}
                              detailsPanelVisibility={state.detailsPanelVisibility}
                              toggleVisibility={this.toggleVisibility}
                              blockName="detailsKeywordsVisibility"
                              blockTitle={localization.DETAILS.textKeywords}
                              isMainApp={isMainApp}
                              attach={props.actions.attachKeyword}
                              detach={props.actions.detachKeyword}
                              generate={props.actions.generateKeywords}
                              keywords={state.keywords}
                              permissions={state.permissions}
                              selectedAssetsIds={props.assetsIds}
                              disabled={
                                state.permissions.keywordsEditable !== true
                                  || state.currentLock
                                  || !isMetadataEditable
                              }
                              inProgress={props.inProgress.keywords}
                              highlight={state.paramsForHighlight}
                              highlightAnimationReset={this.highlightAnimationReset}
                              modifiedField={state.modifiedMetaFields.Keywords}
                              changeTree={props.mainActions.changeTree}
                              openedTree={props.openedTree}
                              team={props.user.team}
                            />
                          );
                        case 'assignees':
                          return (
                            <DetailsBlock
                              key={id}
                              dataQa="assignees"
                              detailsPanelVisibility={state.detailsPanelVisibility}
                              toggleVisibility={this.toggleVisibility}
                              blockName="detailsAssigneeVisibility"
                              blockTitle={localization.DETAILS.textAssignees}
                            >
                              <UserAssign
                                selectedAssetsIds={props.assetsIds}
                                assignees={state.assignees}
                                assign={props.actions.assignUser}
                                unAssign={props.actions.unAssignUser}
                                highlight={state.paramsForHighlight}
                                highlightAnimationReset={this.highlightAnimationReset}
                                readOnly={
                                  state.permissions.assetAssigneesEditable !== true
                                    || state.currentLock
                                }
                                inProgress={props.inProgress.assignees}
                              />
                            </DetailsBlock>
                          );
                        case 'linkedAssets':
                          return (
                            <DetailsBlock
                              key={id}
                              dataQa="linkeAseets"
                              detailsPanelVisibility={state.detailsPanelVisibility}
                              toggleVisibility={this.toggleVisibility}
                              blockName="detailsLinkedAssetsVisibility"
                              blockTitle={localization.LinkedAssets.title}
                            >
                              <LinkedAssets
                                selectedAssets={props.assetsIds}
                                disabled={
                                  state.permissions.linkedAssetsEditable !== true
                                    || state.currentLock
                                }
                              />
                            </DetailsBlock>
                          );
                        case 'collections':
                          return (
                            <CollectionsComponent
                              key={id}
                              detailsPanelVisibility={state.detailsPanelVisibility}
                              disabled={props.inProgress.collections || state.currentLock}
                              toggleVisibility={this.toggleVisibility}
                              blockName="detailsCollectionsVisibility"
                              blockTitle={localization.DETAILS.textCollections}
                              isMainApp={isMainApp}
                              collections={state.tags}
                              selectedAssets={props.assetsIds}
                              remove={props.actions.removeFromCollection}
                              editingDisabled={
                                !state.permissions.collectionsEditable
                                  || (state.isRestricted
                                    && !state.permissions.restrictedIsAttachableOrRemovable)
                              }
                              highlight={state.paramsForHighlight}
                              highlightAnimationReset={this.highlightAnimationReset}
                              isArchived={state.isArchived}
                              changeTree={props.mainActions.changeTree}
                              openedTree={props.openedTree}
                            />
                          );
                        case 'lightboards':
                          return (
                            <If condition={isAllowedLightboards}>
                              <DetailsBlock
                                key={id}
                                dataQa="lightboards"
                                detailsPanelVisibility={state.detailsPanelVisibility}
                                toggleVisibility={this.toggleVisibility}
                                blockName="detailsLightboardsVisibility"
                                blockTitle={localization.DETAILS.textLightboards}
                              >
                                <Lightboards
                                  collection={props.assets}
                                  selectedAssets={props.assetsIds}
                                  lightboards={state.lightboards}
                                  remove={props.actions.removeFromLightboard}
                                  lightboardsEditable={state.permissions.lightboardsEditable}
                                  disabled={state.currentLock}
                                  changeTree={props.mainActions.changeTree}
                                  openedTree={props.openedTree}
                                />
                              </DetailsBlock>
                            </If>
                          );
                        case 'assetMark':
                          return (
                            <DetailsBlock
                              key={id}
                              dataQa="assetMarks"
                              detailsPanelVisibility={state.detailsPanelVisibility}
                              toggleVisibility={this.toggleVisibility}
                              blockName="detailsMarksVisibility"
                              blockTitle={localization.DETAILS.textAssetMarks}
                            >
                              <AssetMarks
                                eventPrefix="InfoPanel"
                                color={state.color}
                                changeColor={props.actions.changeColor}
                                rating={state.rating}
                                changeRating={props.actions.changeRating}
                                flag={state.flag}
                                changeFlag={props.actions.changeFlag}
                                flagShow={state.permissions.flagShow}
                                flagEditable={
                                  state.permissions.flagEditable
                                    && isMetadataEditable
                                    && !state.isArchived
                                }
                                colorShow={state.permissions.colorShow}
                                colorEditable={
                                  state.permissions.colorEditable
                                    && isMetadataEditable
                                    && !state.isArchived
                                }
                                ratingShow={state.permissions.ratingShow}
                                ratingEditable={
                                  state.permissions.ratingEditable
                                    && isMetadataEditable
                                    && !state.isArchived
                                }
                                selectedAssets={props.assetsIds}
                                highlight={state.paramsForHighlight}
                                highlightAnimationReset={this.highlightAnimationReset}
                                disabled={state.currentLock}
                                modifiedFlag={state.modifiedMetaFields.Flag}
                                modifiedColor={state.modifiedMetaFields.Color}
                                modifiedRating={state.modifiedMetaFields.Rating}
                              />
                            </DetailsBlock>
                          );
                        case 'share':
                          return (
                            <Choose>
                              <When
                                condition={
                                  props.assetsIds.length === 1
                                    && (!state.isRestricted
                                      || (state.isRestricted
                                        && state.permissions.restrictedIsDownloadableOrShareable))
                                }
                              >
                                <Share
                                  key={id}
                                  asset={props.assets.find(
                                    (asset) => asset._id === props.assetsIds[0],
                                  )}
                                  toggleVisibility={this.toggleVisibility}
                                  isVisible={
                                    state.detailsPanelVisibility.detailsAssetShareVisibility
                                  }
                                  disabled={state.currentLock}
                                  assetSharingAllowed={assetSharingAllowed}
                                  inProgress={props.inProgress.share}
                                  onChange={props.actions.changeShare}
                                />
                              </When>
                              <Otherwise>{null}</Otherwise>
                            </Choose>
                          );
                        case 'restrict':
                          return (
                            <Restrict
                              key={id}
                              selectedAssets={props.assetsIds}
                              isRestricted={state.isRestricted}
                              reason={restrictReason}
                              startAt={state.restrictStartAt}
                              expiresAt={state.restrictExpiresAt}
                              toggleVisibility={this.toggleVisibility}
                              isVisible={
                                state.detailsPanelVisibility.detailsAssetRestrictVisibility
                              }
                              disabled={state.currentLock}
                              inProgress={props.inProgress.restrict}
                              onChange={props.actions.changeRestrict}
                              userActions={props.userActions}
                              restrictExpiresAtPlaceholder={state.restrictExpiresAtPlaceholder}
                              restrictStartAtPlaceholder={state.restrictStartAtPlaceholder}
                              teamRestrictReason={teamRestrictReason}
                            />
                          );
                        case 'archive':
                          return (
                            <If condition={isAllowedManageArchive}>
                              <ArchiveAssetTab
                                key={id}
                                selectedAssetsIds={props.assetsIds}
                                isArchived={state.isArchived}
                                reason={state.archivedByReason}
                                isVisible={
                                  state.detailsPanelVisibility.detailsAssetArchiveVisibility
                                }
                                toggleVisibility={this.toggleVisibility}
                                disabled={
                                  state.currentLock && state.detailsPanelEditable.lockAlways
                                }
                                total={props.total}
                              />
                            </If>
                          );
                        case 'watermarks':
                          return (
                            <If condition={isAllowedManageWatermarksToAssets && isMainApp && props.user.team?.featureFlags?.watermarks}>
                              <WatermarkAssetsTab
                                selectedAssets={props.assets}
                                key={id}
                                canEditWatermarks={canEditWatermarks}
                                selectedAssetsIds={props.assetsIds}
                                isVisible={
                                  state.detailsPanelVisibility.detailsAssetWatermarkVisibility
                                }
                                toggleVisibility={this.toggleVisibility}
                                disabled={
                                  state.currentLock && state.detailsPanelEditable.lockAlways
                                }
                                attach={props.actions.attachWatermark}
                                allWatermarks={store.getState().assets.watermarks}
                                watermarkId={state.watermarkId}
                                inProgress={props.inProgress.watermarking}
                              />
                            </If>
                          );
                        case 'customFields':
                          return (
                            <CustomFields
                              key={id}
                              detailsPanelVisibility={state.detailsPanelVisibility}
                              collection={props.assets}
                              selectedAssetsIds={props.assetsIds}
                              customFieldsEditable={
                                state.permissions.customFieldsEditable && isMetadataEditable
                              }
                              isMainApp={isMainApp}
                              toggleVisibility={this.toggleVisibility}
                              onChange={props.actions.changeCustomField}
                              inProgress={props.inProgress.customField}
                              inProgressItems={props.inProgress.customFields}
                              metadating={state.metadating}
                              disabled={state.currentLock}
                              customFieldsAllowed={customFieldsAllowed}
                              modifiedFields={state.modifiedMetaFields}
                              userId={userId}
                            />
                          );
                        case 'map':
                          return (
                            <DetailsBlock
                              key={id}
                              dataQa="map"
                              detailsPanelVisibility={state.detailsPanelVisibility}
                              toggleVisibility={this.toggleVisibility}
                              blockName="detailsMapVisibility"
                              blockTitle="Map"
                            >
                              <Map collection={props.assets} />
                            </DetailsBlock>
                          );
                        default:
                          return null;
                        }
                      })}

                      <If condition={isMainApp}>
                        <div className="detailsPanel__toggle-edit">
                          <Button
                            color="primary"
                            onClick={() => {
                              Logger.log('User', 'EditWidgets');
                              toggleEditPanel();
                            }}
                          >
                            {localization.DETAILS.editWidgets}
                          </Button>
                        </div>
                      </If>
                    </div>
                  </div>
                </>
              </Otherwise>
            </Choose>
          </div>
        )}
      </DetailsPanelConfig>
    );
  }
}

function preparePermissions(permissions, archived) {
  return {
    fileNameShow: isMainApp || picsioConfig.access.fileNameShow,
    fileNameEditable: isMainApp && permissions.editAssetFilename,
    titleOrDescriptionShow:
      isMainApp || picsioConfig.access.titleShow || picsioConfig.access.descriptionShow,
    titleEditable: isMainApp ? permissions.editAssetTitle : picsioConfig.access.titleEditable,
    titleShow: isMainApp || picsioConfig.access.titleShow,
    descriptionEditable: isMainApp
      ? permissions.editAssetDescription
      : picsioConfig.access.descriptionEditable,
    descriptionShow: isMainApp || picsioConfig.access.descriptionShow,
    keywordsCanCreate: isMainApp,
    keywordsEditable: isMainApp && permissions.editAssetKeywords,
    upload: isMainApp && permissions.upload,
    keywordsAutogeneration:
      isMainApp && permissions.editAssetKeywords && permissions.autogenerateKeywords,
    assetAssigneesEditable: isMainApp && permissions.editAssetAssignees,
    linkedAssetsEditable: isMainApp && permissions.editAssetLinkedAssets,
    collectionsShow: isMainApp,
    collectionsEditable: isMainApp && permissions.editAssetCollections,
    lightboardsShow: isMainApp,
    lightboardsEditable: isMainApp,
    flagEditable: isMainApp ? permissions.editAssetMarks : picsioConfig.access.flag,
    flagShow: isMainApp || picsioConfig.access.flagShow,
    ratingEditable: isMainApp ? permissions.editAssetMarks : picsioConfig.access.rating,
    ratingShow: isMainApp || picsioConfig.access.ratingShow,
    colorEditable: isMainApp ? permissions.editAssetMarks : picsioConfig.access.color,
    colorShow: isMainApp || picsioConfig.access.colorShow,
    customFieldsShow: isMainApp || picsioConfig.access.customFieldsShow,
    customFieldsEditable: isMainApp && permissions.editAssetMetadata,
    flagOrColorOrRatingShow:
      isMainApp
      || picsioConfig.access.flagShow
      || picsioConfig.access.ratingShow
      || picsioConfig.access.colorShow,
    assetsIsDownloadable:
      isMainApp
      && (archived
        ? permissions.downloadArchive && permissions.downloadFiles
        : permissions.downloadFiles),
    assetsIsRemovable:
      isMainApp
      && (archived ? permissions.deleteArchive && permissions.deleteAssets : permissions.deleteAssets),
    isAllowedSAS: isMainApp && permissions.websites,
    isRestrictEditable: isMainApp && permissions.manageAssetRestrictSettings,
    restrictedIsDownloadableOrShareable: isMainApp && permissions.restrictedDownload,
    restrictedMetadataEditable: isMainApp && permissions.restrictedChangeMetadata,
    restrictedIsAttachableOrRemovable: isMainApp && permissions.restrictedMoveOrDelete,
  };
}

function getNegativePermissions(permissions) {
  const negativePermissions = { editingDisabled: true };
  for (const property in permissions) {
    if (property.includes('Show')) {
      negativePermissions[property] = permissions[property];
    } else {
      negativePermissions[property] = false;
    }
  }
  return negativePermissions;
}

function prepareModifiedMetaFields(modifiedMetaFields = []) {
  const obj = {};
  if (modifiedMetaFields.length) {
    modifiedMetaFields.forEach((item) => {
      obj[item.name] = item;
    });
  }
  return obj;
}

Details.defaultProps = {
  archiveActions: {},
};
Details.propTypes = {
  assets: array,
  assetsIds: arrayOf(string),
  inProgress: object,
  total: number,
  actions: object,
  mainActions: object,
  archiveActions: object,
  panelName: string,
  textareaHeightNameLS: string,
  error: object,
  user: object,
};

export default Details;
