import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';

import * as utils from '../../../shared/utils';

const LegalTabContent = props => {
	const { className, isLoading, title, html, content, children, skeleton } = props;

	return (
		<div className={clsx('legalTabContent', className)}>
			<div className="legalTitle">{title}</div>
			<div className="legalText">
				<Choose>
					<When condition={isLoading}>{skeleton}</When>
					<Otherwise>
						<Choose>
							<When condition={html}>
								<div dangerouslySetInnerHTML={{ __html: utils.sanitizeXSS(html) }} />
							</When>
							<Otherwise>{content}</Otherwise>
						</Choose>
					</Otherwise>
				</Choose>
			</div>
			{children}
		</div>
	);
};

LegalTabContent.defaultProps = {
	className: '',
	html: null,
	content: null,
	children: null,
};
LegalTabContent.propTypes = {
	className: PropTypes.string,
	isLoading: PropTypes.bool.isRequired,
	title: PropTypes.string.isRequired,
	html: PropTypes.string,
	content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	children: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
	skeleton: PropTypes.oneOfType([PropTypes.object, PropTypes.node]).isRequired,
};

export default LegalTabContent;
