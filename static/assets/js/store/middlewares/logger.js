import _upperFirst from 'lodash/upperFirst';

import Logger from '../../services/Logger';

const ignoredActions = [
  'SetActiveCollection',
  'SetActiveLightboard',
  'SetActiveInbox',
  'ToggleAdBlockWarning',
];

const parseActionType = (type) => {
  const category = type.slice(0, type.indexOf('/'));
  const action = type.slice(type.indexOf('/') + 1, type.lastIndexOf('/'));
  const status = type.slice(type.lastIndexOf('/') + 1, type.length);

  return {
    category: _upperFirst(category),
    action: _upperFirst(action),
    status,
  };
};

const logger = () => (next) => (action) => {
  const {
    type, payload, meta, error,
  } = action;

  if (meta) {
    const { action: currentAction, status } = parseActionType(type);

    /** @TODO - we really need to log every action ??? no need all PAYLOAD
     *  e.g. ALL user keywords
     */
    // if (status === 'fulfilled' && !ignoredActions.includes(currentAction)) {
    //   Logger.log('User', `${currentAction}Success`, payload);
    // }
    if (status === 'rejected') {
      const err = payload || error;
      Logger.error(new Error(`${currentAction}Error`), { error: err }, [err.message]);
    }
  }

  next(action);
};

export default logger;
