import React from 'react';
import { bool, func, string, number } from 'prop-types';
import cn from 'classnames';
import outy from 'outy';
import ua from '../../ua';
import throttle from 'lodash.throttle';
import Button from './Button';

class JobsStatusOpener extends React.Component {
	$drop = React.createRef();
	fetch = throttle(this.props.fetch, 3000);

	state = {
		showDrop: false,
  };

  static getDerivedStateFromProps(nextProps, state) {
		if (nextProps.isToolbarDropdownOpened !== state.showDrop) {
			return { showDrop: nextProps.isToolbarDropdownOpened };
		}
		return null;
	}

	handleMobileClick = () => {
		if (!ua.browser.isNotDesktop()) return;

		const showDrop = !this.state.showDrop;
		if (this.props.isToolbarDropdownOpened) {
			this.props.resetDropdowns();
		}
		this.setState({ showDrop });

		if (showDrop) {
			this.outsideClick = outy(this.$drop.current, ['click'], this.handleOutsideClick);
		} else if (this.outsideClick) {
			this.outsideClick.remove();
		}
	};

	handleOutsideClick = () => {
		if (!ua.browser.isNotDesktop()) return;

		this.setState({ showDrop: !this.state.showDrop });
		if (this.outsideClick) this.outsideClick.remove();
	};

	render() {
		const { props, state } = this;
		let dropdownStyle;

		if (ua.browser.isNotDesktop()) {
			dropdownStyle = { display: state.showDrop ? 'flex' : 'none' };
		}

		return (
			<div
				id="button-jobsStatusOpener"
				className={cn('jobsStatusOpener', {
					'drop-active': state.showDrop,
					[props.additionalClass]: props.additionalClass,
				})}
				onClick={this.handleMobileClick}
				onMouseEnter={this.fetch}
				role="button"
			>
				<div className="jobs-status">
					<Choose>
						<When condition={props.isSyncRunning && props.jobsCount === 0}>
							<span>Syncing</span>
						</When>
						<Otherwise>
							<Choose>
								<When condition={Number(props.jobsCount) > 0}>
									{props.jobsCount} <span>Processing</span>
								</When>
								<Otherwise>{null}</Otherwise>
							</Choose>
						</Otherwise>
					</Choose>
					<div className="jobs-status-spinner" />
				</div>
				<div className="toolbarDropdownWrapper" ref={this.$drop} style={dropdownStyle}>
					<div
						className={cn('toolbarDropdown', {
							'drop-active-left': props.left,
							[props.additionalClass]: props.additionalClass,
						})}
					>
						<header className="toolbarDropdownHeader">
							<div className="toolbarName">{props.name || ''}</div>
							<Button id="button-close" icon="close" onClick={this.handleOutsideClick} />
						</header>
						{props.children}
					</div>
				</div>
			</div>
		);
	}
}

JobsStatusOpener.propTypes = {
	additionalClass: string,
	left: bool,
	jobsCount: number,
	isToolbarDropdownOpened: bool,
	resetDropdowns: func,
	isSyncRunning: bool,
};

export default JobsStatusOpener;
