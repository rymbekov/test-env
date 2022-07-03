import React from 'react'; // eslint-disable-line

/**
 * Class Spinner
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.text
 */
const Spinner = ({ title, text }) => (
	<div className="picsioSpinner partial">
		<div className="innerPicsioSpinner">
			<div className="spinner">
				<div />
				<span />
			</div>
			{title && <div className="titleSpinner show">{title}</div>}
			{text && <div className="textSpinner">{text}</div>}
		</div>
	</div>
);

export default Spinner;
