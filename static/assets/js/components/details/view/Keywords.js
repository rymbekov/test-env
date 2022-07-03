import React from 'react';
import {
  array, arrayOf, object, func, bool, string,
} from 'prop-types';
import cn from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { useSelector } from 'react-redux';
import KeywordsDropdown from '../../keywordsDropdown';
import AssetsKeywords from '../../AssetsKeywords';
import sendEventToIntercom from '../../../services/IntercomEventService';
import localization from '../../../shared/strings';
import { setSearchRoute } from '../../../helpers/history';
import Logger from '../../../services/Logger';
import * as UtilsCollections from '../../../store/utils/collections';

const aiKeywordsUrl = '/teammates?tab=aiKeywords';
function Keywords({
  detailsPanelVisibility,
  toggleVisibility,
  blockName,
  blockTitle,
  isMainApp,
  attach,
  detach,
  changeTree,
  generate,
  keywords,
  selectedAssetsIds,
  permissions,
  disabled,
  inProgress,
  highlight,
  highlightAnimationReset,
  modifiedField,
  openedTree,
  team,
}) {
  const isCreatableKeywords = useSelector((state) => {
    const isAddKeywordsOutsideVocabulary = state.user.role.permissions.addKeywordsOutsideVocabulary;
    const { isKeywordsActionsAllowed } = state.user;
    return (isAddKeywordsOutsideVocabulary || isKeywordsActionsAllowed);
  });
  const onAttachKeyword = (keyword) => {
    let { title } = keyword;
    // keyword can be array, when user attach it with comma (,)
    if (Array.isArray(keyword)) {
      const kw = keyword.map((item) => item.title);
      title = kw.join(',');
    }
    Logger.log('User', 'InfoPanelKeywordsChange', { id: keyword._id, name: title });
    attach(title, selectedAssetsIds);
  };
  const onDetachKeyword = (keyword) => {
    Logger.log('User', 'InfoPanelKeywordsChange', { id: keyword._id, name: keyword.title });
    detach(keyword._id, selectedAssetsIds);
  };

  const onKeywordClickHandler = (keywordId) => {
    if (changeTree && openedTree !== 'keywords') {
      changeTree('keywords');
    }
    setSearchRoute({ tagId: UtilsCollections.getRootId(), keywords: keywordId });
  };

  const generateKeywords = () => {
    generate(selectedAssetsIds);
    sendEventToIntercom('keywords generated');
  };

  const isVisible = () => detailsPanelVisibility[blockName];
  return (
    <div
      data-qa="details-component-keywords"
      className={cn('detailsPanel__item', { act: isVisible(), disabled })}
    >
      <div className="detailsPanel__title">
        <span
          className="detailsPanel__title_text"
          role="button"
          tabIndex={0}
          onKeyPress={() => toggleVisibility(blockName)}
          onClick={() => toggleVisibility(blockName)}
        >
          {blockTitle}
        </span>
      </div>
      <CSSTransition in={isVisible()} timeout={300} classNames="fade">
        <>
          <If condition={isVisible()}>
            <div className="detailsPanel__keywords">
              <AssetsKeywords
                generateKeywords={
                  isMainApp && !disabled && permissions.keywordsAutogeneration 
                    ? generateKeywords
                    : null
                }
                team={team}
                className="assetsAiKeywords"
                url={aiKeywordsUrl}
              />
            </div>
            <KeywordsDropdown
              placeholder={localization.DROPDOWN.placeholderKeywords}
              placeholderIcon="emptyKeywords"
              icon="keyword"
              filterText={localization.DROPDOWN.chooseKeywords}
              createText={localization.DROPDOWN.createKeyword}
              createPlaceholderText={localization.DROPDOWN.placeholderKeywordsCreate}
              checkedItems={keywords}
              onCheckedHandler={onAttachKeyword}
              onUncheckedHandler={onDetachKeyword}
              canCreate={permissions.keywordsCanCreate && isCreatableKeywords}
              onItemClickHandler={onKeywordClickHandler}
              highlight={highlight}
              highlightAnimationReset={highlightAnimationReset}
              highlightAnimationResetName="keyword"
              readOnly={!permissions.keywordsEditable === true || disabled}
              inProgress={inProgress}
              modifiedField={modifiedField}
            />
          </If>
        </>
      </CSSTransition>
    </div>
  );
}

Keywords.defaultProps = {
  detailsPanelVisibility: {},
  toggleVisibility: Function.prototype,
  blockName: '',
  blockTitle: '',
  isMainApp: true,
  attach: Function.prototype,
  generate: Function.prototype,
  detach: Function.prototype,
  changeTree: Function.prototype,
  keywords: [],
  permissions: {},
  highlight: [],
  highlightAnimationReset: Function.prototype,
  modifiedField: null,
  inProgress: false,
  disabled: false,
};

Keywords.propTypes = {
  detailsPanelVisibility: object,
  toggleVisibility: func,
  blockName: string,
  blockTitle: string,
  isMainApp: bool,
  attach: func,
  detach: func,
  generate: func,
  keywords: array,
  selectedAssetsIds: arrayOf(string).isRequired,
  permissions: object,
  disabled: bool,
  inProgress: bool,
  highlight: arrayOf(string),
  highlightAnimationReset: func,
  changeTree: func,
  modifiedField: object,
  openedTree: string,
  team: object,
};

export default Keywords;
