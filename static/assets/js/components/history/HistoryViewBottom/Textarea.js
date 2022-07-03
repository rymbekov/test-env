import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import picsioConfig from '../../../../../../config';
import localization from '../../../shared/strings';

import Mentions from './Mentions';

const HistoryTextarea = forwardRef(({ onKeyDown, onBlur, onFocus }, ref) => {
  const textareaRender = (
    <div
      ref={ref}
      className="commentTextarea"
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      placeholder={localization.HISTORY.textPlaceholderAddComment}
      role="textbox"
      aria-label="Add comment"
      tabIndex={0}
      contentEditable
      onFocus={onFocus}
    />
  );

  return (
    <Choose>
      <When condition={picsioConfig.isMainApp()}>
        <Mentions>
          {textareaRender}
        </Mentions>
      </When>
      <Otherwise>
        {textareaRender}
      </Otherwise>
    </Choose>
  );
});

HistoryTextarea.propTypes = {
  onKeyDown: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
};

export default HistoryTextarea;
