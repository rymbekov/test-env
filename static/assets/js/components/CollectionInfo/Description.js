import React, { memo, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';
import PropTypes from 'prop-types';
import { Collapse } from '@picsio/ui';
import { useDispatch } from 'react-redux';
import Logger from '../../services/Logger';
import { Textarea } from '../../UIComponents';

const Description = (props) => {
  const dispatch = useDispatch();
  const {
    isOpen,
    toggleCollapseVisibility,
    isEditCollectionAllowed,
    collection,
    changeCollectionDescription,
  } = props;
  const prevCollection = usePrevious(collection);
  const [collectionDescription, setCollectionDescription] = useState(collection.description);
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    if (prevCollection?._id !== collection._id) {
      setCollectionDescription(collection.description);
      setInProgress(collection.isDescriptionChanging);
    }

    if (collection && collection.isDescriptionChanging === false && inProgress) {
      setInProgress(collection.description);
      setInProgress(false);
    }
  }, [collection, prevCollection, inProgress]);

  const handleDescriptionChange = (event) => {
    const { value } = event.currentTarget;
    setCollectionDescription(value);
  };

  const initCollectionDescriptionChanging = () => {
    setCollectionDescription(collection.description);
  };

  const changeDescription = (event) => {
    const { value } = event.currentTarget;
    if (collection.description !== collectionDescription) {
      Logger.log('User', 'CollectionInfoCollectionDescription', { collectionId: collection._id });
      setInProgress(true);
      dispatch(changeCollectionDescription(collection._id, value));
    }
  };

  return (
    <Collapse
      fontSize="md"
      isOpen={isOpen}
      onClick={() => {
        toggleCollapseVisibility('description');
      }}
      title="Description"
      transition
    >
      <Textarea
        placeholder="Enter description"
        value={collectionDescription || ''}
        onFocus={initCollectionDescriptionChanging}
        onChange={handleDescriptionChange}
        onBlur={changeDescription}
        disabled={!isEditCollectionAllowed || inProgress}
      />
    </Collapse>
  );
};

Description.defaultProps = {
  isOpen: true,
};

Description.propTypes = {
  isOpen: PropTypes.bool,
  collection: PropTypes.shape({
    _id: PropTypes.string,
    description: PropTypes.string,
    isDescriptionChanging: PropTypes.bool,
  }).isRequired,
  isEditCollectionAllowed: PropTypes.bool.isRequired,
  changeCollectionDescription: PropTypes.func.isRequired,
  toggleCollapseVisibility: PropTypes.func.isRequired,
};

export default memo(Description);
