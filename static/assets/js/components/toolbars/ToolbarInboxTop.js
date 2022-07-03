import React from 'react';
import PropTypes from 'prop-types';
import HelpButton from './HelpButton';
import Group from './Group';

import cn from 'classnames';
import Logo from './LogoSimple';

class ToolbarScreenTop extends React.Component {
	static propTypes = {
		onClose: PropTypes.func,
	};

	render() {
		const { props } = this;

		return (
			<div className="toolbar toolbarCatalogTop toolbarScreenTop">
				<Group>
					<Logo additionalClass={cn('logoPicsio', { disabled: props.unauthorized })} />
				</Group>
				<Group additionalClass="assetNameWrapper breadCrumbs">
					<ul>
						{props.title.map((item, index) => (
							<li key={index}>{item}</li>
						))}
					</ul>
				</Group>
				<Group>
					{props.helpLink && <HelpButton icon="question" tooltipPosition="bottom" component={props.helpLink} />}
				</Group>
			</div>
		);
	}
}

export default ToolbarScreenTop;
