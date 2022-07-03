import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import * as utils from '../shared/utils';

const picsioThemes = {
  light: {
    skeletonColor: '#dddddd',
    skeletonHighlight: '#aaaaaa',
    chartLineColor: '#00be4c',
    chartAxisColor: '#cccccc',
    chartAxisLineColor: 'var(--chart-axis-line-color)',
    pieChartGradientStart: '#00be4c',
    pieChartGradientFinish: '#79d699',
    upgradePlanBg: '#f4f4f4',
    backgroundStatusBarColor: '#f4f4f4',
  },
  dark: {
    skeletonColor: '#444444',
    skeletonHighlight: '#666666',
    chartLineColor: '#1b4e2f',
    chartAxisColor: '#cccccc',
    chartAxisLineColor: 'var(--chart-axis-line-color)',
    pieChartGradientStart: '#00bd4c',
    pieChartGradientFinish: '#1b4e2f',
    upgradePlanBg: '#111111',
    backgroundStatusBarColor: '#000000',
  },
};

const ThemeContext = createContext({
  themes: picsioThemes.dark,
  toggleTheme: () => {},
});

export class ThemeProvider extends React.Component {
  state = {
    themes: picsioThemes.dark,
  };

  componentDidMount() {
    const { user } = this.props;

    const getUserSettingsItem = (key, _user) => {
      const settings = _user.settings || {};
      return settings && settings[key];
    };

    const themeName = getUserSettingsItem('picsioTheme', user) || 'dark';
    this.toggleTheme(themeName);
  }

  toggleTheme = (themeName) => {
    this.setAppThemeClass(themeName);
    this.setState({ themes: picsioThemes[themeName] });

    const isStatusBarAvailable = Capacitor.isPluginAvailable('StatusBar');
    if (isStatusBarAvailable) {
      StatusBar.setStyle({
        style: Style[utils.capitalizeFirstLetter(themeName)],
      });
      if (Capacitor.getPlatform() === 'android') {
        const color = picsioThemes[themeName].backgroundStatusBarColor;
        StatusBar.setBackgroundColor({ color });
      }
    }
  };

  setAppThemeClass = (themeName) => {
    if (themeName) {
      const $root = document.documentElement;
      const removeList = [...$root.classList].filter((cl) => (cl.match(/(^|\s)picsioTheme\S+/g) || []).join(' '));

      $root.classList.remove(...removeList);
      $root.classList.add(`picsioTheme${utils.capitalizeFirstLetter(themeName)}`);
    }
  };

  render() {
    const { themes } = this.state;
    const { children } = this.props;

    return (
      <ThemeContext.Provider value={{ themes, toggleTheme: this.toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }
}

ThemeProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export const ThemeConsumer = ThemeContext.Consumer;
