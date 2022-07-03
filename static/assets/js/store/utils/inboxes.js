import sdk from '../../sdk';
import store from '../index';

const getState = () => store.getState().inboxes;

/**
 * Get inbox by id
 * @param {string} inboxId
 * @returns {Promise}
 */
// eslint-disable-next-line import/prefer-default-export
export const getInboxWithId = async (inboxId) => {
  let { inboxes } = getState();
  if (!inboxes) {
    const { data } = await sdk.inboxes.getAll();
    inboxes = data;
  }
  return inboxes.find((inbox) => inbox._id === inboxId);
};
