import React from 'react';
import { Button } from '../../UIComponents';
import ErrorBoundary from '../ErrorBoundary';
import Logger from '../../services/Logger';
import Warning from '../Warning';
import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';
import { back } from '../../helpers/history';
import './styles.scss';

export default function ScreenWarning({
  warningTitle,
  warningText,
  warningIcon = 'error',
  screenTitle,
  text,
  onOk = Function.prototype,
  onCancel = Function.prototype,
  textBtnOk,
  textBtnCancel,
}) {
  const destroy = () => {
    Logger.log('User', 'ScreenWarningHide');
    back();
    onCancel && onCancel();
  };

  return (
    <div className="pageWrapper">
      <ErrorBoundary className="errorBoundaryPage">
        <div className="page screenWarning">
          <ToolbarScreenTop title={[screenTitle]} onClose={destroy} />
          <div className="pageContent">
            <div className="pageContainer">
              <Warning
                icon={warningIcon}
                title={warningTitle}
                text={warningText}
                size="large"
                type="error"
              />
              {text}
              <div className="screenWarningButtons">
                <Button id="button-okWarning" className="buttonReset" onClick={onOk} type="submit">
                  {textBtnOk}
                </Button>
                <Button id="button-cancelWarning" className="buttonAction" onClick={destroy} type="reset">
                  {textBtnCancel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
