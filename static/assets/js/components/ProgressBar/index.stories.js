import React from 'react';
import ProgressBar from './index';
import cn from 'classnames';
import './../../../css/picsio.scss';

import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs';

const stories = storiesOf('Progress Bar', module);
stories.addDecorator(withKnobs);

stories.add('Main', () => {
	return (
		<div className={cn({ picsioThemeLight: boolean('Light theme', false) })}>
			<ProgressBar percent={number('Progress', 0)} text={text('Text', 'Loading...')} />
		</div>
	);
});
