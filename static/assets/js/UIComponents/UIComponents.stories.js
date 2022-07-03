import React from 'react';
import cn from 'classnames';
import { Input, ImagePicker, Textarea, Checkbox, Radio, InputDateRange } from '../UIComponents';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, select } from '@storybook/addon-knobs';

const stories = storiesOf('UIComponents', module);
stories.addDecorator(withKnobs);

stories.add('Input', () => {
	const placeholderText = 'Placeholder';
	const valueText = 'Some value';
	const labelText = 'Some text label';
	const errorText = 'Some error message';

	return (
		<div
			className={cn({
				picsioThemeLight: boolean('Light theme', false),
				whiteBg: boolean('Light theme', false),
			})}
			style={{ padding: '10px 15px' }}
		>
			<div className="storyRow flex">
				<div className="col1-2">
					<h3>Input with placeholder</h3>
					<Input
						placeholder={text('Input placeholder text', placeholderText)}
						label={text('Input label text', labelText)}
						disabled={boolean('Disable input', false)}
					/>
				</div>
				<div className="col1-2">
					<h3>Input disabled</h3>
					<Input
						placeholder={text('Input placeholder text', placeholderText)}
						label={text('Input label text', labelText)}
						disabled
					/>
				</div>
			</div>
			<div className="storyRow flex">
				<div className="col1-2">
					<h3>Input password</h3>
					<Input value="qwerty123" type="password" />
				</div>
				<div className="col1-2">
					<h3>Input with error</h3>
					<Input value={text('Input value text', valueText)} error={text('Input error text', errorText)} />
				</div>
			</div>
		</div>
	);
});

stories.add('InputDateRange', () => {
	const onChangeUpdateDate = () => {
		console.log('onChangeUpdateDate...');
	};

	return (
		<div
			className={cn({
				picsioThemeLight: boolean('Light theme', false),
				whiteBg: boolean('Light theme', false),
			})}
			style={{ padding: '10px 15px' }}
		>
			<div className="storyRow flex">
				<InputDateRange value={'any'} onChange={onChangeUpdateDate} />
			</div>
		</div>
	);
});

stories.add('Checkbox', () => {
	const onCheckboxChange = value => {
		console.log('onCheckboxChange value: ', value);
	};

	const onCheckboxChange2 = value => {
		console.log('onCheckboxChange value: ', value);
	};

	return (
		<div
			className={cn({
				picsioThemeLight: boolean('Light theme', false),
				whiteBg: boolean('Light theme', false),
			})}
			style={{ padding: '10px 15px' }}
		>
			<div className="storyRow">
				<div className="pageItemCheckbox">
					<Checkbox label="checkbox value one" onChange={onCheckboxChange} />
				</div>
				<div className="pageItemCheckbox">
					<Checkbox value={true} label="checkbox value two" onChange={value => onCheckboxChange2(value)} />
				</div>
			</div>
		</div>
	);
});

stories.add('Radio', () => {
	const onRadioChange = value => {
		console.log('onRadioChange value: ', value);
	};

	const onRadioChange2 = (event, value) => {
		console.log('onRadioChange event: ', event);
		console.log('onRadioChange value: ', value);
	};

	return (
		<div
			className={cn({
				picsioThemeLight: boolean('Light theme', false),
				whiteBg: boolean('Light theme', false),
			})}
			style={{ padding: '10px 15px' }}
		>
			<div className="storyRow">
				<div className="pageItemRadio">
					<Radio label="Radio value one" onChange={onRadioChange} />
				</div>
				<div className="pageItemRadio">
					<Radio
						value={true}
						label="Radio value two"
						onChange={(event, value) => {
							onRadioChange2(event, value);
						}}
					/>
				</div>
			</div>
		</div>
	);
});
