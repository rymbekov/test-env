import React from 'react';
import {
  string, shape, func, objectOf,
} from 'prop-types';

import localization from '../../../shared/strings';
import { Select, Input, Textarea } from '../../../UIComponents';

import StripeFooter from '../StripeFooter';
import countries from '../configs/countries';
import InfoTax from './InfoTax';

export default function Info({
  name,
  email,
  footer,
  address,
  tax,
  handlers,
  errors,
}) {
  const { changeCustomerTax, setError } = handlers;

  return (
    <div className="pageContainer">
      <div className="pageTabsContentInfo">
        <div className="pageItemTitle">{localization.BILLING.titleInfo}</div>
        <div className="pageTabsContentInfo__items">
          <div className="pageTabsContentInfo__companyItem">
            <Input
              label={localization.BILLING.inputLabelCompany}
              placeholder={localization.BILLING.inputPlaceholderCompany}
              defaultValue={name}
              error={errors.name}
              onBlur={(e) => { handlers.onBlurNameInput(e.currentTarget.value); }}
            />
          </div>
          <div className="pageTabsContentInfo__adressItem">
            <Input
              label={localization.BILLING.inputLabelStreetAdress}
              placeholder={localization.BILLING.inputPlaceholderStreetAdress}
              defaultValue={address.line1}
              error={errors.line1}
              onBlur={(e) => { handlers.onBlurAddressInput('line1', e.currentTarget.value); }}
            />
          </div>
          <div className="pageTabsContentInfo__cityItem">
            <Input
              label={localization.BILLING.inputLabelCity}
              placeholder={localization.BILLING.inputPlaceholderCity}
              defaultValue={address.city}
              onBlur={(e) => { handlers.onBlurAddressInput('city', e.currentTarget.value); }}
            />
            <Input
              label={localization.BILLING.inputLabelPostalCode}
              placeholder={localization.BILLING.inputPlaceholderPostalCode}
              defaultValue={address.postal_code}
              error={errors.postal_code}
              onBlur={(e) => { handlers.onBlurAddressInput('postal_code', e.currentTarget.value); }}
            />
          </div>
          <div className="pageTabsContentInfo__countryItem">
            <Select
              label={localization.BILLING.selectLabelCountry}
              options={[{ text: 'Not selected' }, ...countries]}
              value={address.country}
              onChange={(e, value) => { handlers.onBlurAddressInput('country', value); }}
            />
            <Input
              label={localization.BILLING.inputLabelState}
              placeholder={localization.BILLING.inputPlaceholderState}
              defaultValue={address.state}
              error={errors.state}
              onBlur={(e) => { handlers.onBlurAddressInput('state', e.currentTarget.value); }}
            />
          </div>
          <div className="pageTabsContentInfo__emailItem">
            <Input
              label={localization.BILLING.inputLabelEmail}
              placeholder={localization.BILLING.inputPlaceholderEmail}
              defaultValue={email}
              error={errors.email}
              onBlur={(e) => { handlers.onBlurEmailInput(e.currentTarget.value); }}
            />
          </div>
          <InfoTax tax={tax} error={errors.tax} changeCustomerTax={changeCustomerTax} setError={setError} />
          <div className="pageTabsContentInfo__textareaItem">
            <Textarea
              label={localization.BILLING.inputLabelInformation}
              placeholder={localization.BILLING.inputPlaceholderInformation}
              defaultValue={footer}
              onBlur={(e) => { handlers.onBlurFooterInput(e.currentTarget.value); }}
            />
          </div>
        </div>
        <StripeFooter />
      </div>
    </div>
  );
}

Info.defaultProps = {
  errors: {},
  address: {},
  name: '',
  footer: '',
  email: '',
};

Info.propTypes = {
  handlers: shape({
    onBlurNameInput: func.isRequired,
    onBlurEmailInput: func.isRequired,
    onBlurFooterInput: func.isRequired,
  }).isRequired,
  errors: objectOf(string),
  address: objectOf(string),
  name: string,
  footer: string,
  email: string,
};
