import React from 'react'; // eslint-disable-line
import { string, number, bool } from 'prop-types';
import cn from 'classnames';
import localization from '../../../shared/strings';
import Icon from '../../Icon';
import UpgradePlan from '../../UpgradePlan';
import { navigate } from '../../../helpers/history';

class Creator extends React.Component {
	/** PropTypes */
	static propTypes = {
	  type: string,
	  title: string,
	  order: number,
	  disabled: bool,
	};

	render() {
	  const { type } = this.props;
	  const order = this.props.order || 0;
	  const disabled = this.props.disabled || false;

	  return (
	    <div
	      className={cn('itemCustomFields itemCustomFieldsCreator', {
	        itemCustomFieldsTitle: type === 'group',
	        disabled,
	      })}
	      onClick={!disabled ? () => navigate(`/customfields/add?type=${type}&order=${order}`) : null}
	      data-title={this.props.title}
	      onDragEnter={this.props.dragenter}
	      onDragEnd={this.props.dragend}
  >
	      <span className={cn('itemCustomFieldsIcon', { folderFull: type === 'group', plus: type === 'field' })}>
	        {type === 'group' && (
  <>
  <Icon name="folderFull" />
  <Icon name="plus" />
	          </>
	        )}
	        {type === 'field' && <Icon name="plus" />}
  </span>
	      <span className={cn('fieldName', { separatorName: type === 'group' })}>
	        {type === 'group' ? localization.CUSTOMFIELDSSCHEMA.createGroup : localization.CUSTOMFIELDSSCHEMA.createField}
  </span>
	      {disabled && <UpgradePlan />}
  </div>
	  );
	}
}

export default Creator;
