import { useReducer, useMemo, useCallback } from 'react';
import produce from 'immer';
import _get from 'lodash/get';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';

const initialState = {
  plan: null,
  storage: null,
};

/* eslint-disable no-param-reassign */
const reducer = produce((state, { type, payload }) => {
  // eslint-disable-next-line default-case
  switch (type) {
  case 'select/plan': {
    const { plan, storage } = payload;

    state.plan = plan;
    if (storage) {
      state.storage = storage;
    }
    break;
  }
  case 'select/storage': {
    const { plan, storage } = payload;

    state.storage = storage;
    if (plan) {
      state.plan = plan;
    }
    break;
  }
  }
}, initialState);
/* eslint-enable no-param-reassign */

const usePlansReducer = (plans, storages, isPicsioStorage, isUserStorageSelected) => {
  const [selectedPlans, dispatch] = useReducer(reducer, initialState);
  const selectedPlanId = _get(selectedPlans, 'plan.planId', null);
  const selectedStorageSize = _get(selectedPlans, 'storage.maxGB', null);

  const selectPlan = useCallback((planId, setDefaultValue = true) => {
    const index = _findIndex(plans, { planId });
    const plan = plans[index];
    let storage = null;

    if (setDefaultValue) {
      if (plan && isPicsioStorage) {
        const { id } = plan;

        // Default storage selection
        if (id === 'free') {
          if (!selectedStorageSize || selectedStorageSize === 20) {
            // eslint-disable-next-line prefer-destructuring
            storage = storages[1];
          }
        } else if (!isUserStorageSelected) {
          storage = storages[index];
        }
      }
    }

    dispatch({ type: 'select/plan', payload: { plan, storage } });
  }, [plans, storages, selectedStorageSize, isPicsioStorage, isUserStorageSelected]);

  const selectStorage = useCallback((storageId, setDefaultValue = true) => {
    const storage = _find(storages, (item) => item.month.planId === storageId
      || item.year.planId === storageId);
    let plan = null;

    if (setDefaultValue) {
      if (!selectedPlanId && storage) {
        if (storage.maxGB === 20) {
          // eslint-disable-next-line prefer-destructuring
          plan = plans[1];
        } else {
          // eslint-disable-next-line prefer-destructuring
          plan = plans[0];
        }
      }
    }

    dispatch({ type: 'select/storage', payload: { plan, storage } });
  }, [plans, storages, selectedPlanId]);

  const result = useMemo(() => [selectedPlans, { selectPlan, selectStorage }],
    [selectedPlans, selectPlan, selectStorage]);

  return result;
};

export default usePlansReducer;
