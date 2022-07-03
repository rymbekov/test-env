import React from 'react';
import cn from 'classnames';
import { UserComponent, Author } from './index';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

const stories = storiesOf('UserComponent', module);
stories.addDecorator(withKnobs);

const accounts = [
	{
		_id: 1,
		email: 'alexey@pics.io',
		displayName: 'Alexey Morashko',
		avatar: 'https://s3.amazonaws.com/avatars.pics.io/users/5d9c936695b346250544d3df.jpg',
		roleName: 'Team owner',
	},
	{
		_id: 2,
		email: 'roman@pics.io',
		displayName: 'Roman Sinovoz',
		avatar: 'https://s3.amazonaws.com/avatars.pics.io/users/5dd2920e3c338a912b3ee28a.png',
		roleName: 'Teammate',
	},
	{
		_id: 3,
		email: 'test@test.test',
		displayName: 'Without Avatar',
		roleName: 'Test role',
	},
	{
		_id: 4,
		email: 'test@test.test',
		displayName: 'Transparent Avatar',
		avatar: 'https://s3.amazonaws.com/avatars.pics.io/users/5d9f00bf7163912386300713.png',
		roleName: 'Test role',
	},
];

stories.add('User component', () => {
	let ActiveUser = select('Active user', { user1: 1, user2: 2, user3: 3, user4: 4 }, 1);

	const signoutSession = () => {
		console.log('onRemove');
	};

	const handleSelect = id => {
		console.log('id: ', id);
	};

	return (
		<div className={cn({ picsioThemeLight: boolean('Light theme', false) })}>
			<ul className="accountList" style={{ padding: '25px', maxWidth: '300px' }}>
				{accounts.map((account, index) => (
					<li key={index}>
						<UserComponent
							isActive={ActiveUser === account._id}
							user={account}
							onRemove={signoutSession}
							onClick={action('handleSelect')}
						/>
					</li>
				))}
			</ul>
		</div>
	);
});

stories.add('Author component', () => {
	return (
		<div className={cn({ picsioThemeLight: boolean('Light theme', false) })}>
			<ul className="accountList" style={{ padding: '25px', maxWidth: '300px' }}>
				{accounts.map((account, index) => (
					<li key={index}>
						<Author avatar={account.avatar} name={account.displayName} additional={account.roleName} />
					</li>
				))}
			</ul>
		</div>
	);
});
