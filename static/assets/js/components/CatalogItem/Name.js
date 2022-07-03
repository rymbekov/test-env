import React, { useRef } from 'react';
import useHover from '@react-hook/hover';
import PropTypes from 'prop-types';
import Logger from '../../services/Logger';
import picsioConfig from '../../../../../config';
import Icon from '../Icon';

const NameGD = ({
  fileNameShow, storageId, name, isListViewMode, fileExtension, itemWidth,
}) => {
  let text = name;
  if (isListViewMode) {
    text += `.${fileExtension}`;
  }

  const catalogItemName = useRef();
  const isHovering = useHover(catalogItemName, { enterDelay: 0, leaveDelay: 0 });

  return (
    <>
      <If condition={fileNameShow}>
        <div className="catalogItem__name" ref={catalogItemName}>
          <div className="catalogItem__name-holder" style={{ width: isHovering && itemWidth }}>
            <span className="catalogItem__name-ext">
              <span className="catalogItem__name-name">
                <Choose>
                  <When condition={picsioConfig.isMainApp()}>
                    <span>{text}.</span>
                    <a
                      className="catalogItem__name-openIn"
                      href={`https://docs.google.com/file/d/${storageId}/edit`}
                      onClick={(event) => {
                        event.stopPropagation();
                        Logger.log('User', 'ThumbnailOpenInGD');
                      }}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon name="openIn" />
                    </a>
                  </When>
                  <Otherwise>
                    <span>{text}.</span>
                  </Otherwise>
                </Choose>
              </span>
              <If condition={!isListViewMode}><span>{fileExtension}</span></If>
              <Icon name="logoGD" />
            </span>
          </div>
        </div>
      </If>
    </>
  );
};

const NameS3 = ({
  fileNameShow, name, isListViewMode, fileExtension, itemWidth,
}) => {
  const catalogItemName = useRef();
  const isHovering = useHover(catalogItemName, { enterDelay: 0, leaveDelay: 0 });

  return (
    <>
      <If condition={fileNameShow}>
        <div className="catalogItem__name" ref={catalogItemName}>
          <div className="catalogItem__name-holder" style={{ width: isHovering && itemWidth }}>
            <span className="catalogItem__name-ext">
              <span className="catalogItem__name-name">
                <span>
                  {name}
                  {isListViewMode ? `.${fileExtension}` : ''}
                </span>
              </span>
              <If condition={!isListViewMode}><span>{fileExtension}</span></If>
              <Icon name="amazonS3" />
            </span>
          </div>
        </div>
      </If>
    </>
  );
};

const Name = (props) => {
  const {
    storageType,
    fileNameShow,
    storageId,
    shortName,
    isListViewMode,
    fileExtension,
    itemWidth,
  } = props;

  return (
    <>
      <Choose>
        <When condition={storageType === 's3'}>
          <NameS3
            fileNameShow={fileNameShow}
            name={shortName}
            isListViewMode={isListViewMode}
            fileExtension={fileExtension}
            itemWidth={itemWidth}
          />
        </When>
        <Otherwise>
          <NameGD
            fileNameShow={fileNameShow}
            storageId={storageId}
            name={shortName}
            isListViewMode={isListViewMode}
            fileExtension={fileExtension}
            itemWidth={itemWidth}
          />
        </Otherwise>
      </Choose>
    </>
  );
};

NameGD.propTypes = {
  fileExtension: PropTypes.string.isRequired,
  fileNameShow: PropTypes.bool.isRequired,
  isListViewMode: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  storageId: PropTypes.string.isRequired,
  itemWidth: PropTypes.number.isRequired,
};

NameS3.propTypes = {
  fileExtension: PropTypes.string.isRequired,
  fileNameShow: PropTypes.bool.isRequired,
  isListViewMode: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  itemWidth: PropTypes.number.isRequired,
};

Name.propTypes = {
  fileExtension: PropTypes.string.isRequired,
  fileNameShow: PropTypes.bool.isRequired,
  isListViewMode: PropTypes.bool.isRequired,
  shortName: PropTypes.string.isRequired,
  storageId: PropTypes.string.isRequired,
  storageType: PropTypes.string.isRequired,
  itemWidth: PropTypes.number.isRequired,
};

export default Name;
