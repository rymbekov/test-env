import React, { Component } from 'react';
import { Checkbox, Input } from '../../UIComponents';
import Warning from '../Warning';
import localization from '../../shared/strings';
import * as utils from '../../shared/utils';

class ConfirmComponent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: '',
			password: '',
			iUnderstandValue: false,
			formErrors: { email: '', password: '', iunderstand: '', serverError: '' },
			renderErrors: false,
		};
	}

	componentDidMount() {
		this.validateEmail();
		this.validatePassword();
		this.validateIUnderstand();
	}

	handleChangeInput = e => {
		const name = e.target.dataset.name;
		const value = e.target.value;
		this.setState({ [name]: value }, () => {
			if (name === 'email') {
				this.validateEmail();
			} else if (name === 'password') {
				this.validatePassword();
			}
		});
	};

	handleChangeCheckbox = value => {
		this.setState({ iUnderstandValue: value }, () => {
			this.validateIUnderstand();
		});
	};

	validateEmail = () => {
		const { email } = this.state;
		const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		let { formErrors } = this.state;
		formErrors.email = re.test(email) ? '' : localization.CONFIRM.emailInvalid;
		formErrors.serverError = '';
		this.setState({ formErrors });
	};

	validatePassword = () => {
		const { password } = this.state;

		let { formErrors } = this.state;
		formErrors.password = password.length > 0 ? '' : localization.CONFIRM.passwordInvalid;
		formErrors.serverError = '';
		this.setState({ formErrors });
	};

	validateIUnderstand = () => {
		let { formErrors, iUnderstandValue } = this.state;
		formErrors.iunderstand = iUnderstandValue ? '' : localization.CONFIRM.checkboxInvalid;

		this.setState({ formErrors });
	};

	hasErrors = () => {
		const { formErrors } = this.state;

		return Object.keys(formErrors).some(name => !!formErrors[name]);
	};

	onSubmitForm = () => {
		const { email, password } = this.state;

		if (this.hasErrors()) {
			this.setState({ renderErrors: true });
			return;
		}

		const data = {
			email: email,
			password: password,
		};

		this.props.handler(data, {
			handlerNotSuccess: () => {
				let { formErrors } = this.state;
				formErrors.serverError = localization.CONFIRM.serverError;

				this.setState({ renderErrors: true, formErrors });
			},
		});
	};

	render() {
		const { title, content, buttonText, labelText } = this.props;
		const { iUnderstandValue, formErrors, renderErrors } = this.state;

		const isRenderErrorEmail = renderErrors && !!formErrors.email.length;
		const isRenderErrorPassword = renderErrors && !!formErrors.password.length;
		const isRenderErrorIunderstand = renderErrors && !!formErrors.iunderstand.length;

		return (
			<div className="confirmComponent">
				<div className="pageContent">
					<div className="pageContainer">
						<Warning icon="error" title={title} size="large" type="error" />
						<div className="confirmComponentBody">
							<div dangerouslySetInnerHTML={{ __html: utils.sanitizeXSS(content) }} />
							<div className="confirmComponentForm">
								<div className="row">
									<Input
										isDefault={true}
										type="text"
										dataName="email"
										autoComplete="off"
										placeholder={localization.CONFIRM.placeholderLogin}
										className={isRenderErrorEmail ? "has-error" : ""}
										onChange={this.handleChangeInput}
									/>
									{(isRenderErrorEmail || formErrors.serverError) && (
										<div className="error">{formErrors.email || formErrors.serverError}</div>
									)}
								</div>
								<div className="row">
									<Input
										isDefault={true}
										type="password"
										dataName="password"
										autoComplete="new-password"
										placeholder={localization.CONFIRM.placeholderPassword}
										className={isRenderErrorPassword ? "has-error" : ""}
										onChange={this.handleChangeInput}
									/>
									{isRenderErrorPassword && <div className="error">{formErrors.password}</div>}
								</div>
								<div className="row">
									<Checkbox label={labelText} onChange={this.handleChangeCheckbox} value={iUnderstandValue} />
									{isRenderErrorIunderstand && <div className="error">{formErrors.iunderstand}</div>}
								</div>
								<div className="row">
									<span className="btnSelectAll picsioDefBtn removeBtn" onClick={this.onSubmitForm}>
										{buttonText}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ConfirmComponent;
