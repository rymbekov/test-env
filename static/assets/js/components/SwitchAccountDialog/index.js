import React, { useState, useEffect } from 'react';
import cn from 'classnames';
/** Store */
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from '../../store';
import * as actions from '../../store/actions/user';
import { removeCurrentUserWebPushSubscription } from '../../store/helpers/user';

import sdk from '../../sdk';
import UiBlocker from '../../services/UiBlocker';
import Logger from '../../services/Logger';
import Icon from '../Icon';
import Creator from '../Creator';
import AccountList from './AccountList';
import LoginForm from '../LoginForm';
import { reloadApp } from '../../helpers/history';

function SwitchAccountDialog({ destroy, accounts, userActions }) {
  const currentUserId = accounts.find((account) => account.current)._id;
  const [selectedId, setSelectedId] = useState(currentUserId);
  const [isLoginFormVisible, changeIsLoginFormVisible] = useState(false);

  useEffect(() => {
    Logger.log('UI', 'SwitchAccountDialog', { accounts: accounts.length });
  }, []);

  const handleCancel = () => {
    Logger.log('User', 'SwitchAccountDialogCancel');
    destroy();
  };

  const addAccount = () => {
    Logger.log('User', 'SwitchAccountDialogAddAccount');
    changeIsLoginFormVisible(!isLoginFormVisible);
  };

  const switchAccount = async () => {
    Logger.log('User', 'SwitchAccountDialogOk');
    if (selectedId === null) return;

    const selectedAccount = accounts.find((account) => account._id === selectedId);
    if (selectedAccount && !selectedAccount.current) {
      UiBlocker.block('Switching...');
      try {
        await removeCurrentUserWebPushSubscription();
        await sdk.users.switchAccount(selectedAccount._id);
        reloadApp();
      } catch (err) {
        Logger.error(new Error('Can not switch account'), { error: err, showDialog: true }, [
          'SwitchAccountFailed',
          selectedAccount._id,
        ]);
        UiBlocker.unblock();
      }
    }
  };

  return (
    <div className="simpleDialog switchAccountDialog">
      <div className="simpleDialogUnderlayer" />
      <div className="simpleDialogBox">
        <div className="simpleDialogHeader">
          <span className="simpleDialogTitle">{isLoginFormVisible ? 'Add account' : 'Switch account'}</span>
          <span className="simpleDialogBtnCross" onClick={handleCancel}>
            <Icon name="close" />
          </span>
        </div>
        <div className="simpleDialogContent">
          <Choose>
            <When condition={isLoginFormVisible}>
              <div className="simpleDialogContentInner loginForm">
                <div className="simpleDialogDescription">
                  <LoginForm withGoogleButton withMicrosoftButton componentPrefix="SwitchAccountDialogLogin" />
                </div>
              </div>
            </When>
            <Otherwise>
              <div className="simpleDialogContentInner">
                <div className="simpleDialogDescription">
                  <AccountList
                    accounts={accounts}
                    select={setSelectedId}
                    selectedId={selectedId}
                    setAuthorizedUsers={userActions.setAuthorizedUsers}
                  />
                  <Creator text="Add account" size={50} onCreate={addAccount} />
                </div>
              </div>
            </Otherwise>
          </Choose>
        </div>
        <div className="simpleDialogFooter">
          {!isLoginFormVisible && (
            <>
              <span className="simpleDialogFooterBtn simpleDialogFooterBtnCancel" onClick={handleCancel}>
                Cancel
              </span>
              <span
                className={cn('simpleDialogFooterBtn', {
                  disabled: selectedId === null || selectedId === currentUserId,
                })}
                onClick={switchAccount}
              >
                Switch
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (store) => ({ accounts: store.user.authorizedUsers });
const mapDispatchToProps = (dispatch) => ({ userActions: bindActionCreators(actions, dispatch) });
const ConnectedDialog = connect(mapStateToProps, mapDispatchToProps)(SwitchAccountDialog);

export default (props) => (
  <Provider store={store}>
    <ConnectedDialog {...props} />
  </Provider>
);
