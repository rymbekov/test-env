import React from 'react';
import localization from '../../../shared/strings';
import imageSizes from '../configs/imageSizes';
import sdk from '../../../sdk';
import Logger from '../../../services/Logger';
import { ThemeConsumer } from '../../../contexts/themeContext';

import { Checkbox, Radio, Select } from '../../../UIComponents';
import { showDialog } from '../../dialog';

export default class Settings extends React.Component {
	updatePreviewThumbnailSizeSetting = async value => {
		try {
			this.props.handlers.onSetPreviewSize(value);
			await sdk.users.updatePreviewThumbnailSizeSetting(value);
		} catch (err) {
			showDialog({
				title: localization.SERVER_ERROR.title,
				text: localization.NOTIFICATION_SETTINGS.errorSavingSettings,
				textBtnCancel: null,
			});
			Logger.error(new Error('Can not update PreviewThumbnailSizeSetting'), { error: err }, [
				'UpdateMyAccountSettingsFailed',
				(err && err.message) || 'NoMessage',
			]);
		}
	};

	render() {
		let { handlers, userData } = this.props;

		return (
			<div className="pageTabsContentSettings">
				<div className="pageContainer">
					<div className="pageItem">
						<div className="pageItemTitle">{localization.ACCOUNT.sectionNameNetwork}</div>
						<div className="pageItemSelect mediumInput">
							<Select
								label={localization.ACCOUNT.sectionPreviewLabel}
								onChange={(event, value) => {
									this.updatePreviewThumbnailSizeSetting(value);
								}}
								options={imageSizes}
								value={userData.settings.previewThumbnailSize}
							/>
						</div>
						<div className="pageItemCheckbox">
							<Checkbox
								label={localization.ACCOUNT.sectionUploadLabel}
								value={userData.settings.disableParallelUpload}
								onChange={handlers.onCheckParallelUpload}
							/>
							<div className="pageItemCheckboxDescription">{localization.ACCOUNT.sectionUploadText}</div>
						</div>
					</div>
					<div className="pageItem">
						<div className="pageItemTitle">{localization.ACCOUNT.sectionNameLocale}</div>
						<div className="radioListVertical">
							<div className="radioListItem">
								<Radio
									label="23 Dec 2020 16:00"
									value={userData.settings.dateLocale === 'en-gb'}
									onChange={handlers.onSetDateLocale}
								/>
							</div>
							<div className="radioListItem">
								<Radio
									label="Dec 23, 2020 4:00 PM"
									value={userData.settings.dateLocale === 'en-us'}
									onChange={handlers.onSetDateLocale}
								/>
							</div>
						</div>
						<div className="pageItemSelect">
							<div className="pageItemCheckboxDescription">{localization.ACCOUNT.sectionNameText}</div>
						</div>
					</div>
					<ThemeConsumer>
						{({ toggleTheme }) => (
							<div className="pageItem">
								<div className="pageItemTitle">{localization.ACCOUNT.sectionNameScheme}</div>
								<div className="radioListVertical">
									<div className="radioListItem">
										<Radio
											label={localization.ACCOUNT.sectionSchemeLabelDark}
											value={userData.settings.picsioTheme === 'dark'}
											onChange={(event, value) => {
												toggleTheme('dark');
												handlers.onCheckColorScheme(event, value);
											}}
										/>
									</div>
									<div className="radioListItem">
										<Radio
											label={localization.ACCOUNT.sectionSchemeLabelLight}
											value={userData.settings.picsioTheme === 'light'}
											onChange={(event, value) => {
												toggleTheme('light');
												handlers.onCheckColorScheme(event, value);
											}}
										/>
									</div>
								</div>
							</div>
						)}
					</ThemeConsumer>
				</div>
			</div>
		);
	}
}
