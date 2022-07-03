import React, { useState, useEffect } from 'react'; // eslint-disable-line
import { useStore } from 'react-redux';
import Logger from '../../services/Logger';
import Dropdown from '../dropdown';
import * as UtilsCollections from '../../store/utils/collections';
import { setSearchRoute } from '../../helpers/history';

let globalUsers = [];

export default function(props) {
	const store = useStore();
	const [users, setUsers] = useState([]);

	useEffect(() => {
		if (!globalUsers.length) {
			getUsers();
		}
	}, []);

	const handleClickItem = userId => {
		const currentUsers = globalUsers.length ? globalUsers : users;
		const user = currentUsers.find(user => user._id === userId);
		const userEmail = user.descr;

		setSearchRoute({ tagId: UtilsCollections.getRootId(), text: `assignees.email:${userEmail}` });
	};
	return (
		<Dropdown
			type="user"
			onItemClickHandler={props.isAllowClickItem && handleClickItem}
			createHandler={null}
			{...props}
			items={globalUsers.length ? globalUsers : users}
		/>
	);

	function getUsers() {
		let items = [];
		try {
			items = store.getState().teammates.items;
		} catch (err) {
			Logger.error(new Error('Can not get team collection'), { error: err });
			return;
		}

		const confirmedUsers = items.filter(user => user.parent === undefined || user.parent.confirmed === true);
		const normalizedUsers = confirmedUsers.map(user => ({
			_id: user._id,
			title: user.displayName,
			descr: user.email,
			url: user.avatar,
		}));

		// we needs to rerender <Dropdown> after first fetch
		setUsers(normalizedUsers);
		globalUsers = normalizedUsers;
	}
}
