import React from 'react';
import PropTypes from 'prop-types';

import { Checkbox } from '../../../UIComponents';

const LegalSupportTab = props => {
	const { value, onChange } = props;

	return (
		<div className="legalSupportTab">
			<Checkbox label="Allow Pics.io team to access your account." value={value} onChange={onChange} />
			<p>
				By clicking allow, you grant Pics.io team access to your account for the next 24 hours to use your information
				in accordance to their terms of service.
			</p>
		</div>
	);
};

LegalSupportTab.defaultProps = {
	value: false,
};
LegalSupportTab.propTypes = {
	value: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
};

export default LegalSupportTab;
