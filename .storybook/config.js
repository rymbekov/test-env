import { addParameters, configure } from '@storybook/react';

configure(require.context('../static/assets/js/components/', true, /\.stories\.js$/), module);
configure(require.context('../static/assets/js/UIComponents/', true, /\.stories\.js$/), module);

// Option defaults:
addParameters({
  options: {
    panelPosition: 'bottom',
  },
});