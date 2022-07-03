import React from 'react';
import PropTypes from 'prop-types';
import {
  TreeItemActions,
} from '@picsio/ui';
import {
  Delete,
  Edit,
  StarBorder,
  Settings,
  AddCircleFilledBold,
  Merge,
} from '@picsio/ui/dist/icons';
import TreeButton from './KeywordsTreeButton';
import localization from '../../shared/strings';

const KeywordsTreeNodeActions = (props) => {
  const {
    isRoot,
    isRootFavorite,
    isFavorite,
    onAdd,
    onDelete,
    onDeleteSelected,
    onRename,
    onFavorite,
    onEditTreeMode,
    onMerge,
    editMode,
    isKeywordsActionsAllowed,
    isAddKeywordsOutsideVocabulary,
    isCurrentSelected,
    isSomeItemSelected,
    isSeveralItemSelected,
  } = props;

  const handleClickDeleteSelected = (event) => {
    if (onDeleteSelected) onDeleteSelected(event);
  };

  const tooltipFavorite = isFavorite
    ? localization.KEYWORDSTREE.textTooltipRemove
    : localization.KEYWORDSTREE.textTooltipAddToFavorites;

  const tooltipEdit = editMode
    ? localization.KEYWORDSTREE.tooltipEditOff
    : localization.KEYWORDSTREE.tooltipEditOn;

  const tooltipCreate = isRoot
    ? localization.KEYWORDSTREE.textTooltipCreate
    : localization.KEYWORDSTREE.textTooltipCreateSub;

  let count = 1;
  if (isSeveralItemSelected) count = 2;

  return (
    <TreeItemActions>
      <If condition={isKeywordsActionsAllowed && onEditTreeMode && isRoot && !isRootFavorite}>
        <TreeButton
          icon={() => <Settings />}
          tooltip={tooltipEdit}
          onClick={onEditTreeMode}
        />
      </If>
      <If condition={(isKeywordsActionsAllowed || isAddKeywordsOutsideVocabulary)
        && !isRootFavorite && !editMode}
      >
        <TreeButton
          icon={() => <AddCircleFilledBold />}
          tooltip={tooltipCreate}
          onClick={onAdd}
        />
      </If>
      <If condition={!isRoot && !editMode}>
        <TreeButton
          icon={() => <StarBorder />}
          tooltip={tooltipFavorite}
          onClick={onFavorite}
        />
      </If>
      <If condition={isKeywordsActionsAllowed && !isRoot}>
        <If condition={!editMode}>
          <TreeButton
            icon={() => <Edit />}
            tooltip={localization.KEYWORDSTREE.textTooltipRename}
            onClick={onRename}
          />
        </If>
        <Choose>
          <When condition={editMode}>
            <TreeButton
              icon={() => <Delete />}
              tooltip={isCurrentSelected
                ? localization.KEYWORDSTREE.textTooltipDeleteKeywords(count)
                : localization.KEYWORDSTREE.textTooltipDelete}
              onClick={handleClickDeleteSelected}
            />
          </When>
          <Otherwise>
            <TreeButton
              icon={() => <Delete />}
              tooltip={localization.KEYWORDSTREE.textTooltipDelete}
              onClick={onDelete}
            />
          </Otherwise>
        </Choose>

      </If>
      <If condition={!isRoot && onMerge && isKeywordsActionsAllowed
        && editMode && (isSomeItemSelected && !isCurrentSelected)}
      >
        <TreeButton
          icon={() => <Merge />}
          tooltip={localization.KEYWORDSTREE.textTooltipMerge}
          onClick={onMerge}
        />
      </If>
    </TreeItemActions>
  );
};

KeywordsTreeNodeActions.defaultProps = {
  editMode: false,
  isRoot: false,
  isRootFavorite: false,
  isFavorite: false,
  onEditTreeMode: null,
  onDeleteSelected: null,
  isCurrentSelected: null,
  isSomeItemSelected: null,
  isSeveralItemSelected: null,
  onMerge: null,
};
KeywordsTreeNodeActions.propTypes = {
  editMode: PropTypes.bool,
  isRoot: PropTypes.bool,
  isRootFavorite: PropTypes.bool,
  isFavorite: PropTypes.bool,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDeleteSelected: PropTypes.func,
  onRename: PropTypes.func.isRequired,
  onFavorite: PropTypes.func.isRequired,
  onMerge: PropTypes.func,
  onEditTreeMode: PropTypes.func,
  isKeywordsActionsAllowed: PropTypes.bool.isRequired,
  isAddKeywordsOutsideVocabulary: PropTypes.bool.isRequired,
  isCurrentSelected: PropTypes.bool,
  isSomeItemSelected: PropTypes.bool,
  isSeveralItemSelected: PropTypes.bool,
};

export default KeywordsTreeNodeActions;
