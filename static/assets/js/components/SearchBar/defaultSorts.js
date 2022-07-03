import React from 'react';
import {
  ClockIcon,
  AzIcon,
  CalendarIcon,
} from '@picsio/ui/dist/icons/';

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
    id: 'updatedAt',
    text: 'Update time',
    icon: <ClockIcon />,
    sort: true,
    sortOptions: ['Old First', 'New First'],
  },
  // {
  //   id: 'separator',
  //   separator: true,
  // },
  // {
  //   id: 'custom',
  //   text: 'Custom',
  //   icon: <HandlePointIcon />,
  // },
];

export default defaultSorts;
