import React from 'react'; // eslint-disable-line
import { string, number } from 'prop-types';
import cn from 'classnames';
import Icon from '../../Icon';
import { navigate } from '../../../helpers/history';

class Creator extends React.Component {
	/** PropTypes */
	static propTypes = {
		type: string,
		order: number,
	};

	render() {
		const { type, order } = this.props;

		return (
			<div
				className="customFieldsItemCreator"
				onClick={() => {
					navigate(`/customfields/add?type=${type}&order=${order}`);
				}}
			>
				<div className={cn('customFieldsItemCreatorHolder', { customFieldsItemCreatorHolderGroup: type === 'group' })}>
					{type === 'group' ? (
						<div className="itemCustomFieldsIcon">
							<Icon name="folderFull" />
							<Icon name="plus" />
						</div>
					) : (
						<div className="customFieldsItemCreatorPlus">
							<Icon name="plus" />
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default Creator;
