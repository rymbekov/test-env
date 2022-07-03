import { connect } from 'react-redux';

import Component from './Overview';

import billingActions from '../../../store/actions/billing';
import { getActivePlansSelector, getUser } from '../../../store/selectors/billing';

const mapStateToProps = (state) => {
  const { billing } = state;

  return {
    ...billing,
    activePlans: getActivePlansSelector(state),
    user: getUser(state),
  };
};

export default connect(mapStateToProps, { ...billingActions })(Component);
