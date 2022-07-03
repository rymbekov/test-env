import React from 'react';
import { render } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('<ProgressBar />', () => {
  it('Should render', () => {
    const { queryByText } = render(<ProgressBar />);
    expect(queryByText('Loading...')).not.toBeNull();
  });

  it('Should render with custom text', () => {
    const { queryByText } = render(<ProgressBar text="Custom text" />);
    expect(queryByText('Custom text')).not.toBeNull();
  });

  it('Should render bar with "pending" classname if no percentage', () => {
    const { container } = render(<ProgressBar />);
    expect(container.querySelector('.pending')).not.toBeNull();
  });

  it('Should render bar with percentage', () => {
    const { container } = render(<ProgressBar percent={50} />);
    expect(container.querySelector('.pending')).toBeNull();
  });
});
