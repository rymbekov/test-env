import sortby from 'lodash.sortby';
import TYPES from '../action-types';
import * as helpers from '../helpers/customFields';

const fakeItems = [
  { isTmp: true, title: '1' },
  { isTmp: true, title: '2' },
  { isTmp: true, title: '3' },
  { isTmp: true, title: '4' },
  { isTmp: true, title: '5' },
];

const defaultState = {
  isLoaded: false,
  isAdding: false,
  items: [],
  groups: [],
  filtredGroups: null,
  error: null,
  addError: null,
  searchQuery: '',
};

export default function (state = defaultState, action) {
  const { type, payload, error } = action;

  switch (type) {
  /** get all custom fields */
  case TYPES.CUSTOM_FIELDS.FETCH.START: {
    return {
      ...state,
      isLoaded: false,
      items: [...fakeItems],
      groups: [...fakeItems],
      error: null,
    };
  }
  case TYPES.CUSTOM_FIELDS.FETCH.COMPLETE: {
    return {
      ...state,
      isLoaded: true,
      items: sortby(payload.items, ['order']),
      groups: helpers.createGroups(sortby(payload.items, ['order'])),
    };
  }
  case TYPES.CUSTOM_FIELDS.FETCH.FAILED: {
    return {
      ...state,
      isLoaded: true,
      items: [],
      groups: [],
      error,
    };
  }

  /** add custom field */
  case TYPES.CUSTOM_FIELDS.ADD.START: {
    return {
      ...state,
      isAdding: true,
      items: sortby([...state.items, { ...payload.item, isTmp: true }], ['order']),
      addError: null,
    };
  }
  case TYPES.CUSTOM_FIELDS.ADD.COMPLETE: {
    return {
      ...state,
      isAdding: false,
      items: sortby(state.items, ['order']).map((item) => {
        if (item.title === payload.item.title) {
						const { isTmp, ...other } = item; // eslint-disable-line
          return { ...other };
        }
        return item;
      }),
      groups: helpers.createGroups(
        sortby(state.items, ['order']).map((item) => {
          if (item.title === payload.item.title) {
							const { isTmp, ...other } = item; // eslint-disable-line
            return { ...other };
          }
          return item;
        }),
      ),
    };
  }
  case TYPES.CUSTOM_FIELDS.ADD.FAILED: {
    return {
      ...state,
      isAdding: false,
      items: sortby(state.items, ['order']).filter((item) => {
        if (item.title !== payload.item.title) {
          return true;
        } if (item.title === payload.item.title && !item.isTmp) {
          return true;
        }
        return false;
      }),
      groups: helpers.createGroups(
        sortby(state.items, ['order']).filter((item) => {
          if (item.title !== payload.item.title) {
            return true;
          } if (item.title === payload.item.title && !item.isTmp) {
            return true;
          }
          return false;
        }),
      ),
      addError: error,
    };
  }

  case TYPES.CUSTOM_FIELDS.REMOVE_ERROR: {
    return {
      ...state,
      error: null,
      addError: null,
    };
  }

  /** remove custom field */
  case TYPES.CUSTOM_FIELDS.REMOVE.START: {
    return {
      ...state,
      items: state.items.map((item) => (item.title === payload.title ? { ...item, isTmp: true } : item)),
      groups: helpers.createGroups(
        state.items.map((item) => (item.title === payload.title ? { ...item, isTmp: true } : item)),
      ),
    };
  }
  case TYPES.CUSTOM_FIELDS.REMOVE.COMPLETE: {
    return {
      ...state,
      items: state.items.filter((item) => item.title !== payload.title),
      groups: helpers.createGroups(state.items.filter((item) => item.title !== payload.title)),
    };
  }
  case TYPES.CUSTOM_FIELDS.REMOVE.FAILED: {
    return {
      ...state,
      items: state.items.map((item) => {
        if (item.title === payload.title) {
						const { isTmp, ...other } = item; // eslint-disable-line
          return { ...other };
        }
        return item;
      }),
      groups: helpers.createGroups(
        state.items.map((item) => {
          if (item.title === payload.title) {
							const { isTmp, ...other } = item; // eslint-disable-line
            return { ...other };
          }
          return item;
        }),
      ),
      error,
    };
  }

  /** update custom fields */
  case TYPES.CUSTOM_FIELDS.UPDATE.START: {
    const { titles } = payload;
    return {
      ...state,
      items: state.items.map((item) => (titles.includes(item.title) ? { ...item, isUpdating: true } : item)),
    };
  }
  case TYPES.CUSTOM_FIELDS.UPDATE.COMPLETE: {
    const { titles, key, value } = payload;
    return {
      ...state,
      items: state.items.map((item) => {
        if (titles.includes(item.title)) {
						const { isUpdating, ...data } = item; // eslint-disable-line
          return { ...data, [key]: value };
        }
        return item;
      }),
      groups: helpers.createGroups(
        state.items.map((item) => {
          if (titles.includes(item.title)) {
							const { isUpdating, ...data } = item; // eslint-disable-line
            return { ...data, [key]: value };
          }
          return item;
        }),
      ),
    };
  }
  case TYPES.CUSTOM_FIELDS.UPDATE.FAILED: {
    const { titles } = payload;
    return {
      ...state,
      items: state.items.map((item) => {
        if (titles.includes(item.title)) {
						const { isUpdating, ...data } = item; // eslint-disable-line
          return { ...data };
        }
        return item;
      }),
      groups: helpers.createGroups(
        state.items.map((item) => {
          if (titles.includes(item.title)) {
							const { isUpdating, ...data } = item; // eslint-disable-line
            return { ...data };
          }
          return item;
        }),
      ),
    };
  }

  /** update custom field */
  case TYPES.CUSTOM_FIELDS.UPDATE_ONE.START: {
    const { customField } = payload;
    return {
      ...state,
      items: state.items.map(
        (item) => (customField.title === item.title ? { ...item, isUpdating: true } : item),
      ),
      groups: helpers.createGroups(
        state.items.map(
          (item) => (customField.title === item.title ? { ...item, isUpdating: true } : item),
        ),
      ),
    };
  }
  case TYPES.CUSTOM_FIELDS.UPDATE_ONE.CANCELLED: {
    const { customField } = payload;
    return {
      ...state,
      items: state.items.map(
        (item) => (customField.title === item.title ? { ...item, isUpdating: false } : item),
      ),
      groups: helpers.createGroups(
        state.items.map(
          (item) => (customField.title === item.title ? { ...item, isUpdating: false } : item),
        ),
      ),
    };
  }
  case TYPES.CUSTOM_FIELDS.UPDATE_ONE.COMPLETE: {
    const { customField } = payload;
    return {
      ...state,
      items: state.items.map((item) => {
        if (customField.title === item.title) {
						const { isUpdating, ...data } = item; // eslint-disable-line
          if (customField.type !== 'enum') {
            delete data.options;
            delete data.multiple;
          }
          return { ...data, ...customField };
        }
        return item;
      }),
      groups: helpers.createGroups(
        state.items.map((item) => {
          if (customField.title === item.title) {
							const { isUpdating, ...data } = item; // eslint-disable-line
            if (customField.type !== 'enum') {
              delete data.options;
              delete data.multiple;
            }
            return { ...data, ...customField };
          }
          return item;
        }),
      ),
    };
  }
  case TYPES.CUSTOM_FIELDS.UPDATE_ONE.FAILED: {
    const { customField } = payload;
    return {
      ...state,
      items: state.items.map((item) => {
        if (customField.title === item.title) {
						const { isUpdating, ...data } = item; // eslint-disable-line
          return { ...data, ...customField };
        }
        return item;
      }),
      groups: helpers.createGroups(
        state.items.map((item) => {
          if (customField.title === item.title) {
							const { isUpdating, ...data } = item; // eslint-disable-line
            return { ...data, ...customField };
          }
          return item;
        }),
      ),
    };
  }

  /** import schema */
  case TYPES.CUSTOM_FIELDS.IMPORT.START: {
    return {
      ...state,
      isLoaded: false,
      items: [...fakeItems],
      groups: helpers.createGroups([...fakeItems]),
    };
  }
  case TYPES.CUSTOM_FIELDS.IMPORT.COMPLETE: {
    return {
      ...state,
      items: payload.items,
      groups: helpers.createGroups(payload.items),
      isLoaded: true,
    };
  }
  case TYPES.CUSTOM_FIELDS.IMPORT.FAILED: {
    return {
      ...state,
      isLoaded: true,
      items: [],
      groups: [],
      error,
    };
  }

  /** move fields */
  case TYPES.CUSTOM_FIELDS.MOVE.START: {
    return {
      ...state,
      items: state.items.map((item) => ({ ...item, isUpdating: true })),
      groups: helpers.createGroups(state.items.map((item) => ({ ...item, isUpdating: true }))),
    };
  }
  case TYPES.CUSTOM_FIELDS.MOVE.COMPLETE: {
    return {
      ...state,
      items: payload.items,
      groups: helpers.createGroups(payload.items),
    };
  }
  case TYPES.CUSTOM_FIELDS.MOVE.FAILED: {
    return {
      ...state,
      items: state.items.map((item) => {
					const { isUpdating, ...data } = item; // eslint-disable-line
        return data;
      }),
      groups: helpers.createGroups(
        state.items.map((item) => {
						const { isUpdating, ...data } = item; // eslint-disable-line
          return data;
        }),
      ),
      error,
    };
  }

  /* Search */
  case TYPES.CUSTOM_FIELDS.SEARCH: {
    return {
      ...state,
      searchQuery: payload.value,
      items: state.items,
      filtredGroups: payload.value ? helpers.createGroups(helpers.makeSearchItems(state.items, payload.value)) : null,
    };
  }

  default: {
    return state;
  }
  }
}
