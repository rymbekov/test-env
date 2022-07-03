import React, { useCallback, useMemo, memo, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { changeField } from '../../../store/inboxApp/actions';

import Wrapper from '../Wrapper';
import { Flags, Colors, StarRating } from '../../../UIComponents';

const AssetMarks = forwardRef((_, ref) => {
  const dispatch = useDispatch();
  /** Flag */
  const {
    value: flagValue, show: flagShow, required: flagRequired, error: flagError,
  } = useSelector((state) => state.flag);

  const handleChangeFlag = useCallback(
    (value) => dispatch(changeField('flag', value)),
    [dispatch],
  );

  /** Color */
  const {
    value: colorValue, show: colorShow, required: colorRequired, error: colorError,
  } = useSelector((state) => state.color);

  const handleChangeColor = useCallback(
    (value) => dispatch(changeField('color', value)),
    [dispatch],
  );

  /** Rating */
  const {
    value: ratingValue, show: ratingShow, required: ratingRequired, error: ratingError,
  } = useSelector((state) => state.rating);

  const handleChangeRating = useCallback(
    (value) => dispatch(changeField('rating', value === ratingValue ? undefined : value)),
    [dispatch, ratingValue],
  );

  const requiredFileds = useMemo(
    () => {
      const required = [];
      if (flagRequired) required.push('flag');
      if (colorRequired) required.push('color');
      if (ratingRequired) required.push('rating');

      /** if all is required -> no need for description */
      if (required.length === 3) return true;

      return required.join(' and ');
    },
    [flagRequired, colorRequired, ratingRequired],
  );

  if (!flagShow && !colorShow && !ratingShow) return null;

  return (
    <Wrapper
      ref={ref}
      title="Asset marks"
      dataQa="assetMarks"
      blockName="inboxAssetMarksVisibility"
      required={requiredFileds}
      error={flagError || colorError || ratingError}
    >
      <div className="assetMarks">
        <If condition={flagShow}>
          <div className="markWithModifiedField">
            <Flags
              value={flagValue}
              onChange={handleChangeFlag}
              error={flagError}
            />
          </div>
        </If>
        <If condition={colorShow}>
          <div className="markWithModifiedField">
            <Colors
              value={colorValue}
              onChange={handleChangeColor}
              error={colorError}
            />
          </div>
        </If>
        <If condition={ratingShow}>
          <div className="markWithModifiedField">
            <StarRating
              value={ratingValue}
              onChange={handleChangeRating}
              error={ratingError}
            />
          </div>
        </If>
      </div>
    </Wrapper>
  );
});

export default memo(AssetMarks);
