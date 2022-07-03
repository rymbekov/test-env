import React, {
  useCallback, useMemo, memo, forwardRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { changeCustomField } from '../../../store/inboxApp/actions';
import CustomField from '../../Search/CustomField';

import Wrapper from '../Wrapper';

const CustomFields = forwardRef((_, ref) => {
  const dispatch = useDispatch();
  const customFields = useSelector((state) => state.customFields);

  const handleChange = useCallback(
    (...args) => dispatch(changeCustomField(...args)),
    [dispatch],
  );
  const error = useMemo(
    () => customFields.reduce((errorText, cf) => (cf.error || errorText), ''),
    [customFields],
  );

  /** don't render if no custom fields OR every is hidden */
  if (!customFields.length || customFields.every(({ show }) => !show)) return null;

  return (
    <Wrapper
      ref={ref}
      title="Custom Fields"
      dataQa="customFields"
      blockName="inboxCustomFieldsVisibility"
      required={customFields.some(({ required }) => required)}
      error={error}
    >
      <div className="customFieldsSelectorWrapper" style={{ margin: '0 0 15px' }}>
        {customFields.filter(({ show }) => show).map((cf) => (
          <CustomField
            key={cf.title}
            {...cf}
            onChange={handleChange}
            error={cf.error}
            required={cf.required}
            position="top"
          />
        ))}
      </div>
    </Wrapper>
  );
});

export default memo(CustomFields);
