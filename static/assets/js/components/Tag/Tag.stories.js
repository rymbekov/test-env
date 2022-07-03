import React from 'react';
import Tag from './index';
import cn from 'classnames';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, select } from '@storybook/addon-knobs';

const stories = storiesOf('Tag', module);
stories.addDecorator(withKnobs);

stories.add('Main', () => {
	const TagTypes = select(
		'Tag type',
		{
			collection: 'collection',
			lightboard: 'lightborad',
			keyword: 'keyword',
			user: 'user',
		},
		'collection'
	);
	const defaultText = 'Click ME!';
	const defaultTooltipText = 'Please! :)';

	const items = [
		{ _id: 1, name: 'Short', avatar: 'https://s3.amazonaws.com/avatars.pics.io/users/5d9c936695b346250544d3df.jpg' },
		{ _id: 2, name: 'Medium', avatar: 'https://s3.amazonaws.com/avatars.pics.io/users/5dd2920e3c338a912b3ee28a.png' },
		{ _id: 3, name: 'Very long name' },
	];

	return (
		<div className={cn({ picsioThemeLight: boolean('Light theme', false) })} style={{ padding: '10px 15px' }}>
			<div className="storyRow">
				<Tag
					text={text('Tag text', defaultText)}
					onClick={() => alert('Thnx!')}
					avatar={text('Avatar', '')}
					tooltipText={text('Tooltip text', defaultTooltipText)}
					type={TagTypes}
					onClose={() => alert('Closed')}
				/>
			</div>
			<div className="storyRow">
				{items.map(item => (
					<Tag
						type={TagTypes}
						text={item.name}
						avatar={TagTypes === 'user' && item.avatar}
						tooltipText={text('Tooltip text', defaultTooltipText)}
						onClick={() => alert('Thnx!')}
						onClose={() => alert('Closed')}
					/>
				))}
			</div>
		</div>
	);
});

stories.add('User', () => (
	<div className={cn({ picsioThemeLight: boolean('Light theme', false) })} style={{ padding: '10px 15px' }}>
		<div className="storyRow">
			<Tag
				text="User Name"
				avatar={text('Avatar', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Pics.io_logo.png')}
				tooltipText="Some user description"
				type="user"
			/>
			<Tag text="Another User Name" tooltipText="Another user" type="user" />
		</div>
	</div>
));
