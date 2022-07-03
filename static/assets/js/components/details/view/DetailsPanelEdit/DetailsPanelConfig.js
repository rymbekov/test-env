import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import picsioConfig from '../../../../../../../config';
import { LocalStorage } from '../../../../shared/utils';

import { sortFieldsByConfigOrder } from './utils';

const isMainApp = picsioConfig.isMainApp();

const defaultFields = [
  {
    id: 'share',
    title: 'Share',
    permission: 'isAllowedSAS',
  },
  {
    id: 'description',
    title: 'Title & Description',
    permission: 'titleOrDescriptionShow',
  },
  {
    id: 'keywords',
    title: 'Keywords',
    permission: null,
  },
  {
    id: 'watermarks',
    title: 'Watermarks',
    permission: null,
  },
  {
    id: 'assignees',
    title: 'Assignees',
    permission: null,
  },
  {
    id: 'linkedAssets',
    title: 'Linked Assets',
    permission: null,
  },
  {
    id: 'collections',
    title: 'Collections',
    permission: 'collectionsShow',
  },
  {
    id: 'lightboards',
    title: 'Lightboards',
    permission: 'lightboardsShow',
  },
  {
    id: 'assetMark',
    title: 'Asset marks',
    permission: 'flagOrColorOrRatingShow',
  },
  {
    id: 'restrict',
    title: 'Restrict',
    permission: 'isRestrictEditable',
  },
  {
    id: 'archive',
    title: 'Archive',
    permission: null,
  },
  {
    id: 'customFields',
    title: 'Custom fields',
    permission: 'customFieldsShow',
  },
  {
    id: 'map',
    title: 'Map',
    permission: 'customFieldsShow',
  },
];

const websiteFieldKeys = ['description', 'assetMark', 'customFields', 'map'];
const websiteFields = defaultFields.filter((f) => websiteFieldKeys.includes(f.id));

const defaultConfig = {
  order: [],
  hidden: [],
};

const getStorageConfig = (userId) => {
  const oldStorageConfig = LocalStorage.get('picsio.detailsPanelConfig');
  const storageConfig = LocalStorage.get('picsio.editWidgetsConfig') || {};

  if (oldStorageConfig && (!storageConfig || !storageConfig[userId])) {
    LocalStorage.set('picsio.editWidgetsConfig', { [userId]: oldStorageConfig });
    LocalStorage.remove('picsio.detailsPanelConfig');
  }

  return storageConfig[userId];
};

const updateStorageConfig = (userId, updatedConfig) => {
  const storageConfig = LocalStorage.get('picsio.editWidgetsConfig');

  LocalStorage.set('picsio.editWidgetsConfig', {
    ...storageConfig,
    [userId]: updatedConfig,
  });
};

const DetailsPanelConfig = (props) => {
  const { userId, children } = props;
  const [isOpen, setOpen] = useState(false);
  const [fields, setFields] = useState([]);
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    if (isMainApp) {
      const storageConfig = getStorageConfig(userId);

      if (storageConfig) {
        const sortedFields = sortFieldsByConfigOrder(defaultFields, storageConfig);

        setFields(sortedFields);
        setConfig(storageConfig);
      } else {
        setFields(defaultFields);
      }
    } else {
      setFields(websiteFields);
    }
  }, [userId]);

  const toggleEditPanel = useCallback(() => {
    setOpen((prevState) => !prevState);
  }, []);

  const updateConfig = useCallback(
    (updatedFields, hidden) => {
      const order = updatedFields.map(({ id }) => id);
      const updatedConfig = { order, hidden };

      setFields(updatedFields);
      setConfig(updatedConfig);

      updateStorageConfig(userId, updatedConfig);
    },
    [userId, setConfig, setFields],
  );

  return children({
    isOpen, fields, config, toggleEditPanel, setFields, updateConfig,
  });
};

DetailsPanelConfig.defaultProps = {
  userId: '',
};

DetailsPanelConfig.propTypes = {
  userId: PropTypes.string,
  children: PropTypes.func.isRequired,
};

export default DetailsPanelConfig;
