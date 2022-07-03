// import io from 'socket';
import { io } from 'socket.io-client';
import picsioConfig from '../../../../config';
import Logger from './Logger';
import getSessionId from '../helpers/getSessionId';
import ua from '../ua';
import * as utils from '../shared/utils';
import PubSubRouter from './PubSubRouter';

let socket;
let initFinished = false;

export default {
  init: (id, apiKey) => {
    if (initFinished) {
      return Logger.info('socket.io is already initialized');
    }
    initFinished = true;

    if (!id) {
      return console.error('Cannot connect to socket. No ID');
    }

    let query = `session_id=${getSessionId()}`;
    if (ua.isMobileApp()) {
      let userToken = apiKey;
      if (!apiKey) {
        userToken = utils.MobileStorage.get('picsio.userToken');
      }
      if (userToken) {
        query += `&token=${userToken}`;
      } else {
        Logger.error(new Error('Can not get userToken'));
      }
    }
    socket = io(`${picsioConfig.PUBSUB_URL}/frontEndApp`, {
      query: {
        session_id: getSessionId(),
      },
      transports: ['websocket'],
    });

    socket.on('connect', () => socket.emit('join', id));

    socket.on('error', (error) => {
      Logger.error(new Error('Can not connect to socket.io'), { error }, [
        'SocketConnectionFailed',
        (error && error.message) || 'NoMessage',
      ]);
    });

    /** Subscribe store to notifications */
    PubSubRouter(socket);
  },
  subscribe: (type, callback) => {
    socket.on(type, callback);
  },
  unsubscribe: (type, callback) => {
    socket.removeListener(type, callback);
  },
};
