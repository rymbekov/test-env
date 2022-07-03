import React, { forwardRef } from 'react';

const InnerRefHoc = Wrapper => forwardRef((props, ref) => <Wrapper {...props} innerRef={ref} />);

export default InnerRefHoc;
