import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@picsio/ui';
import clsx from 'classnames';

import localization from '../../../shared/strings';

import { cardPropTypes } from '../Overview/propTypes';
import { renderText } from './helpers';

const BillingCard = (props) => {
  const { card, onChange, isUnknown } = props;
  const { brand } = card;
  const title = localization.BILLING.titleCard;
  const unknownText = localization.BILLING.textCardNoAdded;
  const buttonText = isUnknown
    ? localization.BILLING.textCardAdd
    : localization.BILLING.textCardChange;
  // iconVisa iconMasterCard iconDiscover iconAmericanExpress iconDinersClub iconJCB
  const icon = brand ? `icon${brand.replace(' ', '')}` : 'iconUnknown';

  return (
    <div className={clsx('billingCard', {
      'billingCard--unknown': isUnknown,
    })}>
      <div className="billingCard__title">
        <h3 className="pageItemTitle">{title}</h3>
      </div>
      <div className="billingCard__info">
        <div className={clsx('billingCard__info__logo', icon)} />
        <div className="billingCard__info__text">
          <Choose>
            <When condition={!isUnknown}>
              {renderText(card)}
            </When>
            <Otherwise>
              <div>{unknownText}</div>
            </Otherwise>
          </Choose>
        </div>
      </div>
      <Button
        className="billingCard__button"
        variant="text"
        color="primary"
        onClick={onChange}
      >
        {buttonText}
      </Button>
    </div>
  );
}

BillingCard.defaultProps = {
  card: {},
};
BillingCard.propTypes = {
  card: PropTypes.shape(cardPropTypes),
  onChange: PropTypes.func.isRequired,
  isUnknown: PropTypes.bool.isRequired,
};

export default BillingCard;
