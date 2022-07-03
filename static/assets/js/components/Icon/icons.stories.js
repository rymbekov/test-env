import React from 'react';
import cn from 'classnames';
import './stories.scss';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean, select } from '@storybook/addon-knobs';
import Icon from './index';
import Icons from './icons';

const stories = storiesOf('Icons', module);

stories.addDecorator(withKnobs);

stories.add('icons', () => {
	const FontSize = select(
		'Tag type',
		{
			'size-12px': '12px',
			'size-16px': '16px',
			'size-24px': '24px',
			'size-36px': '36px',
		},
		'24px'
	);

	return (
		<div className={cn({ picsioThemeLight: boolean('Light theme', false), simpleView: boolean('Simple view', false) })}>
			<div className="storyRow storyIcons">
				{Object.keys(Icons.path).map(name => (
					<div className="storyIcon" key={name}>
						<Icon name={name} style={{ fontSize: FontSize }} />
						<div className="storyIconName">{name}</div>
					</div>
				))}
			</div>
		</div>
	);
});
