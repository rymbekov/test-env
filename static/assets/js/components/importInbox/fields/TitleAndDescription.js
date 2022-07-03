import React, { useCallback, memo, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@picsio/ui';

import { changeField } from '../../../store/inboxApp/actions';
import { LocalStorage } from '../../../shared/utils';

import Wrapper from '../Wrapper';
import { Textarea } from '../../../UIComponents';

const handleResizeDescription = (value) => LocalStorage.set('picsio.inboxDescriptionHeight', value);
const inputStyle = { marginBottom: 15 };

const TitleAndDescription = forwardRef((_, ref) => {
  const dispatch = useDispatch();
  const {
    title = '', description = '', show, required, error,
  } = useSelector((state) => state.titleAndDescription);

  const handleChangeTitle = useCallback(
    (event) => dispatch(changeField('title', event.target.value)),
    [dispatch],
  );

  const handleChangeDescription = useCallback(
    (event) => dispatch(changeField('description', event.target.value)),
    [dispatch],
  );

  if (!show) return null;

  return (
    <Wrapper
      ref={ref}
      title="Title & Description"
      dataQa="description"
      blockName="inboxDescriptionVisibility"
      required={required}
      error={error}
    >
      <Input
        value={title}
        style={inputStyle}
        onChange={handleChangeTitle}
        placeholder="Title"
        error={error && !title.trim()}
      />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={handleChangeDescription}
        height={LocalStorage.get('picsio.inboxDescriptionHeight')}
        onResize={handleResizeDescription}
        error={error && !description.trim()}
      />
    </Wrapper>
  );
});

export default memo(TitleAndDescription);
