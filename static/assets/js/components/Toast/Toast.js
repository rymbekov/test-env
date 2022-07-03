import React from 'react';
import { toast } from 'react-toastify';
import { Button } from '@picsio/ui';
import { isHaveTeammatePermission } from '../../store/helpers/user';
import * as utils from '../../shared/utils';
import { navigate } from '../../helpers/history';

const CustomToast = (children, options) => {
  let customComponent = null;
  if (options?.btnOkValue) {
    customComponent = () => (
      <div className="Toast-body">
        <div className="Toast-body-text">
          <div
            dangerouslySetInnerHTML={{
              __html: utils.sanitizeXSS(children),
            }}
          />
        </div>
        <div className="Toast-body-button">
          <span role="button" tabIndex={0} onClick={options.onOk} onKeyPress={options.onOk}>
            {options.btnOkValue}
          </span>
        </div>
      </div>
    );
  }

  if (options?.audit && isHaveTeammatePermission('accessAuditTrail')) {
    const handleOnClick = () => {
      navigate('/audit?tab=audit');
    };
    customComponent = () => (
      <div className="Toast-body Toast-body-vertical">
        <div className="Toast-body-text">
          {children}
        </div>
        <div className="Toast-body-button">
          <Button
            variant="text"
            color="primary"
            tabIndex={0}
            onClick={handleOnClick}
          >
            Check in Audit trail
          </Button>
        </div>
      </div>
    );
  }

  const CloseButton = ({ closeToast }) => (
    <span
      role="button"
      tabIndex={0}
      onClick={closeToast}
      onKeyPress={closeToast}
      className="Toastify__close-button"
    >
      <svg viewBox="0 0 32 32" width="11" height="11" fill="currentColor">
        <path d="M18.949 16l12.433-12.433c0.816-0.816 0.816-2.133 0-2.949s-2.133-0.816-2.949 0l-12.433 12.433-12.433-12.439c-0.816-0.816-2.133-0.816-2.949 0s-0.816 2.133 0 2.949l12.433 12.439-12.439 12.433c-0.816 0.816-0.816 2.133 0 2.949 0.408 0.408 0.94 0.612 1.478 0.612s1.070-0.204 1.478-0.612l12.433-12.433 12.433 12.433c0.408 0.408 0.94 0.612 1.478 0.612s1.070-0.204 1.478-0.612c0.816-0.816 0.816-2.133 0-2.949l-12.439-12.433z" />
      </svg>
    </span>
  );

  // https://fkhadra.github.io/react-toastify/api/toast
  const configuration = {
    onOpen: () => {},
    onClose: () => {},
    closeButton: CloseButton,
    type: toast.TYPE.DEFAULT,
    hideProgressBar: false,
  };

  toast(customComponent || children, { ...configuration, ...options });
};

export default CustomToast;
