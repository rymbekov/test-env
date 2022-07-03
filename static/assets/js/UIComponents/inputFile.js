import React from 'react';
import { string, func, number } from 'prop-types';
import localization from '../shared/strings';

class InputFile extends React.Component {
	static defaultProps = {
		placeholder: localization.INPUT_FILE.placeholder,
		btnText: localization.INPUT_FILE.btnText
	};

	static propTypes = {
		placeholder: string,
		btnText: string,
		onChange: func,
		customRef: func,
		id: string,
		name: string,
		accept: string,
		resetCount: number
	};

	state = {
		fileName: ''
	};

	componentDidUpdate(prevProps) {
		if (this.props.resetCount !== prevProps.resetCount) this.reset();
	}

	handleChange = event => {
		const filelist = event.target.files;
		const fileName = filelist[0].name;
		this.setState({ fileName });
		this.props.onChange && this.props.onChange(event);
	};

	reset = () => {
		this.setState({ fileName: '' });
		this.el.value = '';
	};

	ref = el => {
		this.el = el;
		this.props.customRef(el);
	};

	render() {
		let { btnText = '', id, name, accept } = this.props;

		return (
			<div className="UIInputFile">
				<div className="UIInputFile__content__btn">
					<input type="file" ref={this.ref} id={id} name={name} accept={accept} onChange={this.handleChange} />
					<span className="picsioDefBtn">{btnText}</span>
				</div>
				<div className="UIInputFile__filename">{this.state.fileName || this.props.placeholder}</div>
			</div>
		);
	}
}

export default InputFile;
