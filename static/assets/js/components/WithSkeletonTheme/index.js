import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeConsumer } from '../../contexts/themeContext';

/**
 * WithSkeletonTheme
 * @param {Object} props
 * @returns {JSX}
 */
export default function WithSkeletonTheme(props) {
  return (
    <ThemeConsumer>
      {({ themes }) => (
        <SkeletonTheme color={themes.skeletonColor} highlightColor={themes.skeletonHighlight}>
          {props.children}
        </SkeletonTheme>
      )}
    </ThemeConsumer>
  );
}
