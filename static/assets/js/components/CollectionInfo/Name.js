import React, {
  memo, forwardRef, useImperativeHandle, useRef, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import cn from 'classnames';
import {
  Archive,
  Folder,
  Web,
} from '@picsio/ui/dist/icons';
import { Icon } from '@picsio/ui';
import { useDispatch } from 'react-redux';
import * as utils from '../../shared/utils';
import Logger from '../../services/Logger';
import { Input } from '../../UIComponents';

const FolderComponent = (props) => (
  <Icon size="lg" {...props}>
    <Choose>
      <When condition={props?.collection?.archived}>
        <Archive />
      </When>
      <When condition={props?.collection?.website}>
        <Web />
      </When>
      <Otherwise>
        <Folder />
      </Otherwise>
    </Choose>
  </Icon>
);

const Name = forwardRef((props, ref) => {
  const { collection, renameCollection, isEditCollectionAllowed } = props;
  const { name, color, isRenaming: isCollectionRenamed } = collection;
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [isRenaming, setRenaming] = useState(false);
  const [renameInProgress, setRemaningProgress] = useState(false);
  const [collectionNewName, setCollectionNewName] = useState('');

  useEffect(() => {
    if (isCollectionRenamed === false && renameInProgress) {
      setRemaningProgress(false);
      setRenaming(false);
    }
  }, [isCollectionRenamed, renameInProgress]);

  const initCollectionRenaming = () => {
    if (!isEditCollectionAllowed) return;
    Logger.log('User', 'CollectionInfoRenameCollection');
    setRenaming(true);
    setCollectionNewName(name);
  };

  useImperativeHandle(ref, () => ({
    initCollectionRenaming,
  }));

  const handleInputRenameBlur = () => {
    if (name !== collectionNewName) {
      setRemaningProgress(true);
      dispatch(renameCollection(collection, collectionNewName));
    } else {
      setRenaming(false);
    }
  };

  const handleInputRenameKeyDown = (event) => {
    const keyCodes = {
      ENTER: 13,
      ESC: 27,
    };

    if (event.keyCode === keyCodes.ENTER) {
      handleInputRenameBlur();
    }

    if (event.keyCode === keyCodes.ESC) {
      setRenaming(false);
    }
  };

  const handleInputRenameChange = (event) => {
    const { value } = event.currentTarget;
    setCollectionNewName(value);
  };

  return (
    <div
      className={cn('InfoPanelHeader__name filename', { isRenaming })}
      onDoubleClick={initCollectionRenaming}
    >
      <Choose>
        <When condition={isRenaming}>
          <Input
            isDefault
            type="text"
            className="assetRenaming"
            value={collectionNewName}
            onChange={handleInputRenameChange}
            onKeyDown={handleInputRenameKeyDown}
            onBlur={handleInputRenameBlur}
            disabled={renameInProgress}
            customRef={inputRef}
            autoFocus
          />
        </When>
        <Otherwise>
          <StyledIconFolder iconColor={color} collection={collection} />
          {utils.decodeSlash(name)}
        </Otherwise>
      </Choose>
    </div>
  );
});

Name.propTypes = {
  collection: PropTypes.shape({
    name: PropTypes.string,
    color: PropTypes.string,
    archived: PropTypes.bool,
    isRenaming: PropTypes.bool,
  }).isRequired,
  renameCollection: PropTypes.func.isRequired,
  isEditCollectionAllowed: PropTypes.bool.isRequired,
};

export default memo(Name);

const StyledIconFolder = styled(FolderComponent)`
  color: ${(props) => {
    if (props.iconColor === 'none') {
      return null;
    }
    return props.iconColor;
  }};
`;
