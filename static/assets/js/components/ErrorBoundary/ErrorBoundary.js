import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import styled from 'styled-components';

import Icon from '../Icon';
import Logger from '../../services/Logger';
import * as utils from '../../shared/utils';

class ErrorBoundary extends React.Component {
  state = { error: null };

  componentDidCatch(error, errorInfo = {}) {
    const ErrorType = 'ReactError';

    this.setState({ error });
    // eslint-disable-next-line no-underscore-dangle
    const _error = error instanceof Error ? error : new Error('ErrorBoundary error');
    Logger.error(_error, {
      ...errorInfo,
      ErrorType,
    });
  }

  render() {
    const { error } = this.state;
    const { className, children, styles } = this.props;

    return (
      <Choose>
        <When condition={error && utils.isObject(styles)}>
          <StyledErrorBoundary className={clsx('errorBoundary', className)} styles={styles}>
            <div className="iconErrorBoundary">
              <Icon name="error" />
            </div>
            <div className="textErrorBoundary">Something went wrong</div>
          </StyledErrorBoundary>
        </When>
        <When condition={error}>
          <div className={clsx('errorBoundary', className)} style={styles}>
            <div className="iconErrorBoundary">
              <Icon name="error" />
            </div>
            <div className="textErrorBoundary">Something went wrong</div>
          </div>
        </When>
        <Otherwise>
          {children}
        </Otherwise>
      </Choose>
    );
  }
}

const StyledErrorBoundary = styled.div.attrs((props) => ({
  style: {
    transform: `translate3d(${props.styles.translateX}px, ${props.styles.translateY}px, 0)`,
    width: props.styles.width,
    height: props.styles.height,
  },
}))``;

ErrorBoundary.defaultProps = {
  className: '',
  children: null,
  styles: null,
};
ErrorBoundary.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
  styles: PropTypes.shape({
    translateX: PropTypes.number,
    translateY: PropTypes.number,
    width: PropTypes.number,
    translaheightteY: PropTypes.number,
  }),
};

export default ErrorBoundary;
