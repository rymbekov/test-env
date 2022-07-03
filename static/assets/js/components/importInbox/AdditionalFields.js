import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useUpdateEffect, usePrevious } from 'react-use';
import cn from 'classnames';

import { bool } from 'prop-types';
import Comment from './fields/Comment';
import TitleAndDescription from './fields/TitleAndDescription';
import AssetMarks from './fields/AssetMarks';
import CustomFields from './fields/CustomFields';

const AdditionalFields = ({ disabled }) => {
  const $holder = useRef();
  const $comment = useRef();
  const $title = useRef();
  const $marks = useRef();
  const $customFields = useRef();

  const commentError = useSelector((state) => state.comment.error);
  const titleError = useSelector((state) => state.titleAndDescription.error);
  const marksError = useSelector(
    (state) => state.flag.error || state.rating.error || state.color.error,
  );

  const showPanel = useSelector((state) => Object.keys(state).reduce((acc, key) => {
    /** some custom fields must be shown */
    if (Array.isArray(state[key])) return [...acc, state[key].some(({ show }) => show)];
    /** some fields must be shown */
    return [...acc, state[key].show];
  }, [])).some(Boolean);

  const hasErrors = useSelector((state) => state.hasErrors);
  const prevHasErrors = usePrevious(hasErrors);

  useUpdateEffect(() => {
    if (hasErrors && !prevHasErrors) {
      let $block = $customFields.current;
      if (marksError) $block = $marks.current;
      if (titleError) $block = $title.current;
      if (commentError) $block = $comment.current;
      if ($holder.current && $block) $holder.current.scrollTop = $block.offsetTop - 30;
    }
  }, [hasErrors, commentError, titleError, marksError, prevHasErrors]);

  if (!showPanel) return null;

  return (
    <div className="importAdditionalFields">
      <div className={cn('importFieldsHolder', { disabled })} ref={$holder}>
        <Comment ref={$comment} />
        <TitleAndDescription ref={$title} />
        <AssetMarks ref={$marks} />
        <CustomFields ref={$customFields} />
      </div>
    </div>
  );
};

AdditionalFields.defaultProps = {
  disabled: false,
};

AdditionalFields.propTypes = {
  disabled: bool,
};

export default AdditionalFields;
