import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../ErrorBoundary';
import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';
import { back } from '../../helpers/history';
import './styles.scss';

export default function ScreenContent(props) {
  const { screenTitle, children, onCancel } = props;

  const destroy = () => {
    back();
    if (onCancel) onCancel();
  };

  return (
    <div className="pageWrapper">
      <ErrorBoundary className="errorBoundaryPage">
        <div className="page screenContent">
          <ToolbarScreenTop title={[screenTitle]} onClose={destroy} />
          <div className="pageContent">
            <div className="pageContainer">
              {children}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}

ScreenContent.defaultProps = {
  children: null,
  onCancel: () => {},
};

ScreenContent.propTypes = {
  screenTitle: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  onCancel: PropTypes.func,
};
