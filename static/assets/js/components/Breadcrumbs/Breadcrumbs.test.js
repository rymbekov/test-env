/*
This test stub is generated automatically .
Uncomment necessary lines and make test green.
*/
import React from 'react';
import { render, screen } from '@testing-library/react';
import Breadcrumbs from './Breadcrumbs';

describe('<Breadcrumbs />', () => {
  it('Should render', () => {
    render(<Breadcrumbs />);
    const breadcrumbsComponent = screen.getByTestId('breadcrumbs');
    expect(breadcrumbsComponent).toHaveClass('breadCrumbs');
  });
});
