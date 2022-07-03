import React from 'react';
import PropTypes from 'prop-types';

import PayGCountsInput from './PaygCountsInput';

const PayGCounts = (props) => {
  const {
    websites,
    teammates,
    websitesCount,
    teammatesCount,
    onChange
  } = props;

  return (
    <div className="paygCounts">
      <PayGCountsInput label={<>Teammates <br /> $18</>} name="teammates" value={teammates} onChange={onChange} min={teammatesCount} />
      <PayGCountsInput label={<>Websites <br /> $12</>} name="websites" value={websites} onChange={onChange} min={websitesCount} />
    </div>
  );
}

PayGCounts.defaultProps = {
  websites: '',
  teammates: '',
};
PayGCounts.propTypes = {
  websites: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  teammates: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  websitesCount: PropTypes.number.isRequired,
  teammatesCount: PropTypes.number.isRequired,
};

export default PayGCounts;
