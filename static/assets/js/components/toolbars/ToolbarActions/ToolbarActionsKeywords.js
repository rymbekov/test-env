import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@picsio/ui';
import {
  Delete,
  Merge,
} from '@picsio/ui/dist/icons';
import mergeKeywords from '../../../helpers/mergeKeywords';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import Tooltip from '../../Tooltip';

const eventPrefix = 'ToolbarActionsKeywords';

const ToolbarActionsKeywords = (props) => {
  const {
    selectedKeywordsIds,
    keywordsActions,
    rolePermissions,
    inProgress,
    tooltipPlacement,
  } = props;

  const handleDelete = () => {
    Logger.log('User', `${eventPrefix}Delete`, { ids: selectedKeywordsIds });
    keywordsActions.deleteSelected(selectedKeywordsIds);
  };

  const handleMerge = () => {
    Logger.log('User', `${eventPrefix}Merge`, { ids: selectedKeywordsIds });
    mergeKeywords(selectedKeywordsIds);
  };

  const deleteTooltip = localization.ACTIONS_TOOLBAR.KEYWORDS.delete(selectedKeywordsIds.length);
  const mergeTooltip = localization.ACTIONS_TOOLBAR.KEYWORDS.merge(selectedKeywordsIds.length);

  return (
    <>
      <If condition={rolePermissions.manageKeywords}>
        <Tooltip
          placement={tooltipPlacement}
          content={deleteTooltip}
        >
          <IconButton
            componentProps={{ 'data-testid': 'keywordsDelete' }}
            className="toolbarButton"
            size="lg"
            color="inherit"
            onClick={handleDelete}
            disabled={inProgress}
          >
            <Delete />
          </IconButton>
        </Tooltip>
        <Tooltip
          placement={tooltipPlacement}
          content={mergeTooltip}
        >
          <IconButton
            componentProps={{ 'data-testid': 'keywordsMerge' }}
            className="toolbarButton"
            size="lg"
            color="inherit"
            onClick={handleMerge}
            disabled={inProgress}
          >
            <Merge />
          </IconButton>
        </Tooltip>
      </If>
    </>
  );
};

ToolbarActionsKeywords.defaultProps = {
  inProgress: false,
  tooltipPlacement: 'top',
};

ToolbarActionsKeywords.propTypes = {
  keywordsActions: PropTypes.shape({
    deleteSelected: PropTypes.func,
    merge: PropTypes.func,
  }).isRequired,
  rolePermissions: PropTypes.shape({
    manageKeywords: PropTypes.bool,
  }).isRequired,
  selectedKeywordsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  tooltipPlacement: PropTypes.string,
  inProgress: PropTypes.bool,
};

export default memo(ToolbarActionsKeywords);
