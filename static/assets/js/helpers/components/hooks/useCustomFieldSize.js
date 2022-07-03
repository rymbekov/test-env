import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux'

import { LocalStorage } from '../../../shared/utils';

const useInputResize = (inputId) => {
  const userId = useSelector(state => state.user._id);

  const saveInputSize = useCallback((height) => {
    const sizes = LocalStorage.get('picsioCustomFieldsSize') || {};
    const userSizes = sizes[userId] || {};
    const updatedSizes = {
      ...sizes,
      [userId]: {
        ...userSizes,
        [inputId]: height,
      },
    };

    LocalStorage.set('picsioCustomFieldsSize', updatedSizes);
  }, [inputId, userId])

  const getInputSize = useCallback(() => {
    const sizes = LocalStorage.get('picsioCustomFieldsSize') || {};
    const userSizes = sizes[userId] || {};

    return userSizes[inputId] || null;
  }, [inputId, userId]);

  const result = useMemo(() => ({
    getInputSize,
    saveInputSize,
  }), [getInputSize, saveInputSize]);

  return result;
};

export default useInputResize;
