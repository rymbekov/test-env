import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const Toggle = ({ children }) => {
	const [state, setState] = useState(false);

	const toggle = useCallback(() => {
		setState(prevState => !prevState);
	}, []);

	return children({ state, toggle });
};

Toggle.propTypes = {
	children: PropTypes.func.isRequired,
};

export default Toggle;
