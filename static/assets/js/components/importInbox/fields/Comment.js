import React, { useCallback, memo, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../../store/inboxApp/actions';
import { LocalStorage } from '../../../shared/utils';
import localization from '../../../shared/strings';

import { Textarea } from '../../../UIComponents';
import Wrapper from '../Wrapper';

const handleResizeTextrea = (value) => LocalStorage.set('picsio.inboxCommentHeight', value);

const Comment = forwardRef((_, ref) => {
  const dispatch = useDispatch();
  const {
    value = '', required, error, show,
  } = useSelector((state) => state.comment);

  const handleChange = useCallback((event) => {
    dispatch(actions.changeField('comment', event.target.value));
  }, [dispatch]);

  if (!show) return null;

  return (
    <Wrapper
      ref={ref}
      title="Comment"
      dataQa="comment"
      blockName="inboxCommentVisibility"
      required={required}
      error={error}
    >
      <Textarea
        placeholder={localization.IMPORT.placeholderInputComment}
        value={value}
        onChange={handleChange}
        onResize={handleResizeTextrea}
        height={LocalStorage.get('picsio.inboxCommentHeight')}
        error={!!error}
        disabled={false}
      />
    </Wrapper>
  );
});

export default memo(Comment);
