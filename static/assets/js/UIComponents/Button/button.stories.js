import React from 'react';
import cn from 'classnames';
import Button from './index';
import Icon from '../../components/Icon';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number, select } from '@storybook/addon-knobs';
import './stories.scss';

const stories = storiesOf('Buttons', module);

stories.addDecorator(withKnobs);

// Knobs for React props
stories.add('with a button', () => {
	const defaultButtonText = 'Default button';
	const label = 'Button type';
	const groupId = 'Dynamic buttons';

	const options = {
		Default: null,
		Action: 'buttonAction',
		Reset: 'buttonReset',
	};
	const defaultValue = null;
	const value = select(label, options, defaultValue, groupId);

	return (
		<div className={cn({ picsioThemeLight: boolean('Light theme', false, groupId) })} style={{ padding: '10px 15px' }}>
			<div className="storyRow">
				<h3>Default buttons</h3>
				<Button
					disabled={boolean('Disabled', false)}
					className={cn({
						buttonAction: boolean('isActionButton', false),
						buttonReset: boolean('isResetButton', false),
					})}
				>
					{text('Button text', defaultButtonText)}
				</Button>

				<Button
					disabled={boolean('Disabled', false, groupId)}
					className={cn({
						[value]: value,
					})}
				>
					{text('Button text', defaultButtonText, groupId)}
				</Button>
			</div>

			<div className="storyRow">
				<Button>Default button</Button>
				<Button className="buttonAction">Action button</Button>
				<Button disabled={true}>Disabled button</Button>
				<Button className="buttonReset">Error button</Button>
			</div>

			<div className="storyRow">
				<Button icon="sync">Disabled button</Button>
				<Button icon="sync" />
			</div>

			<div className="storyRow">
				<h3>Small buttons</h3>
				<span className="buttonSmall">
					<Icon name="sync" />
				</span>
				<span className="buttonSmall">
					<Icon name="magicBranch" />
				</span>
				<span className="buttonSmall">
					<Icon name="clip" />
				</span>
				<span className="buttonSmall">
					<Icon name="close" />
				</span>
			</div>
		</div>
	);
});
