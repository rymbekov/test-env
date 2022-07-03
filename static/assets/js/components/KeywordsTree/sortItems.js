import React from 'react';
import {
  AzIcon,
  CalendarIcon,
} from '@picsio/ui/dist/icons/';
import Icon from '../Icon';

const defaultSorts = [
  {
    id: 'name',
    text: 'Alphabetical',
    icon: <AzIcon />,
    sort: true,
    sortOptions: ['A-Z', 'Z-A'],
  },
  {
    id: 'createdAt',
    text: 'Create time',
    icon: <CalendarIcon />,
    sort: true,
    sortOptions: ['Old First', 'New First'],
  },
  {
    id: 'count',
    text: 'Most used',
    icon: <Icon name="fire" />,
    sort: true,
    sortOptions: ['Last', 'First'],
  },
];

export default defaultSorts;
