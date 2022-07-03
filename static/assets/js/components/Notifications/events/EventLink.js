import React from 'react'
// import PropTypes from 'prop-types'
import classnames from 'classnames';

const EventLink = (props) => {
  const { children, goToUrl, url } = props;
  
  return (
		<span className={classnames('picsioLink', { deactivated: !url })} onClick={(event) => {
			if (goToUrl && url) {
				goToUrl(url)
			} else {
				event.preventDefault();
			}
		}}>
			{children}
		</span>
	);
}

EventLink.propTypes = {};

export default EventLink;

