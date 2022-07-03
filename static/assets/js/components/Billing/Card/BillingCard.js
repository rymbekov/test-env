import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';

import BillingCardView from './BillingCardView';

import { changeCard } from '../../../store/actions/billing';

const BillingCard = () => {
  const card = useSelector((state) => _get(state, 'user.customer.card', {}));
  const dispatch = useDispatch();
  const isUnknown = _isEmpty(card);

  const handleChange = useCallback(() => {
    dispatch(changeCard(isUnknown));
  }, [isUnknown, dispatch]);

  return (
    <div className="pageContainer">
      <BillingCardView
        card={card}
        onChange={handleChange}
        isUnknown={isUnknown}
      />
    </div>
  );
}

BillingCard.propTypes = {};

export default BillingCard;
