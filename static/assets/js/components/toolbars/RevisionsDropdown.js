import React, {
  useEffect, useRef, useState,
} from 'react';
import Select, { components } from 'react-select';
import PropTypes from 'prop-types';
import { Icon } from '@picsio/ui';
import { AddRevision } from '@picsio/ui/dist/icons';
import cn from 'classnames';
import dayjs from 'dayjs';
import Logger from '../../services/Logger';
import { showDialog } from '../dialog';
import localization from '../../shared/strings';
import Tooltip from '../Tooltip/Tooltip';
import { Author } from '../UserComponent';
import sendEventToIntercom from '../../services/IntercomEventService';

const customStyles = {
  menuList: (provided) => ({
    ...provided,
    width: 300,
    background: 'inherit',
    paddingLeft: '10px',
  }),
};

const RevisionsDropdown = (props) => {
  const {
    disabled,
    modified,
    historyItems,
    setActive,
    isSupportedForDiff,
    isDownloadable,
    activeRevisionID,
    lastRevisionNumber,
    addRevision,
    subscriptionFeatures,
    isRevisionUploading,
    isAllowedUploadingRevision,
    ...rest
  } = props;

  const [options, setOptions] = useState();
  const [value, setValue] = useState();
  const inputAddRevision = useRef();

  useEffect(() => {
    const filteredHistoryItems = historyItems?.filter((item) => item.revisionID === undefined);

    const revisionsWithLabels = filteredHistoryItems.map((item) => {
      const label = (
        <div className="revisionOptionContainer">
          <div className="revisionOptionLabel">
            <div className="revisionNumberContainer">
              <div className="revisionNumberCircle">
                {item?.revisionNumber}
              </div>
            </div>
            <div className="">
              <Author
                avatar={item?.uploader?.avatar}
                className="revisionAuthor"
                classNameAdditional="additionalName"
                authorNameClassname="authorAdditionalName"
                authorAdditionalClassname="authorAdditionalClassname"
                name={item?.uploader?.displayName}
                additional={dayjs(item?.modifiedTime).format('lll')}
              />
            </div>
          </div>
        </div>
      );

      return {
        value: item,
        label,
      };
    });

    setOptions(revisionsWithLabels);
  }, [historyItems]);

  useEffect(() => {
    const currentValue = options?.filter(
      (item) => item.value?.id === activeRevisionID,
    );
    setValue(currentValue);
  }, [options, lastRevisionNumber, activeRevisionID]);

  const onChangeAddRevision = () => {
    if (!subscriptionFeatures.revisions) return;
    if (inputAddRevision) {
      Logger.log('User', 'PreviewRevisionsDropdownAddRevision');
      const file = inputAddRevision.current.files[0];
      addRevision(file);
    }
  };

  const onClickMain = (arg) => {
    const isActive = arg.value.id === activeRevisionID;
    const data = arg.value;
    if (!data.canHaveRevisions) {
      if (data.isInitial) {
        showDialog({
          title: localization.HISTORY.switchDialogTitle,
          text: localization.HISTORY.initialRevisionDialogText,
          textBtnOk: localization.HISTORY.switchDialogOk,
          textBtnCancel: null,
        });
      } else if (!isActive && !data.technical && isSupportedForDiff) {
        setActive(data.id);
      }
      if (!isActive && !data.technical && !isSupportedForDiff) {
        const errorText = isDownloadable
          ? localization.HISTORY.textCantShowRevisionButDownload
          : localization.HISTORY.textCantShowRevision;
        Logger.log('UI', 'CanNotSwitchRevisionDialog', errorText);
        showDialog({
          title: localization.HISTORY.switchDialogTitleError,
          text: errorText,
          textBtnOk: localization.HISTORY.switchDialogOk,
          textBtnCancel: null,
        });
      }
    }
    setValue(arg);
  };

  const SingleValue = ({
    ...props
  }) => (
    <components.SingleValue {...props}><div>{`revision ${props?.data?.value?.revisionNumber || 1}`}</div></components.SingleValue>
  );

  const Option = (args) => (
    <span
      className="setAsCurrentRevision"
    >
      <components.Option {...args} isFocused={false} />
    </span>
  );
  const handleMenuListClick = () => {
    subscriptionFeatures.revisions && inputAddRevision.current.click();
  };

  const MenuList = (args) => (
    <components.MenuList {...args}>
      <div>
        {args.children}
        <If condition={isAllowedUploadingRevision}>
          <Tooltip content={!subscriptionFeatures.revisions && localization.UPGRADE_PLAN.tooltipForButtons}>
            <div
              className={
                cn('addRevisionButton buttonFileUpload', { disabled: !subscriptionFeatures.revisions })
              }
              onClick={handleMenuListClick}
            >
              <Icon
                size="md"
                className="revisionIcon"
                color="inherit"
                componentProps={{
                  'data-testid': 'revisionsDropdownUpload',
                }}
              >
                <AddRevision />
              </Icon>
              {localization.TOOLBARS.revisionsDropdown.textAddNewRevision}
            </div>
          </Tooltip>
        </If>
      </div>
    </components.MenuList>
  );

  const handleDropdownOpener = () => {
    sendEventToIntercom('Revisions dropdown opened');
  };

  return (
    <div className="react-select-revisions__revisions" onClick={handleDropdownOpener}>
      <Select
        className="react-select-revisions-container"
        classNamePrefix="react-select-revisions"
        placeholder="loading..."
        value={value}
        onChange={onClickMain}
        options={options}
        isDisabled={disabled || isRevisionUploading}
        styles={customStyles}
        isFocused={false}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator: () => <span className="react-select-revisions__indicator" />,
          Option: modified ? Option : null,
          MenuList: modified ? MenuList : null,
          SingleValue,
        }}
        inputProps={{ autoComplete: 'off', autoCorrect: 'off', spellCheck: 'off' }}
        {...rest}
      />
      <div className="addNewRevision">
        <input type="file" ref={inputAddRevision} onChange={onChangeAddRevision} />
      </div>
    </div>
  );
};

RevisionsDropdown.defaultProps = {
  label: '',
  disabled: false,
  modified: false,
  lastRevisionNumber: 1,
  historyItems: [],
  isSupportedForDiff: false,
};

RevisionsDropdown.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  modified: PropTypes.bool,
  historyItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      keepForever: PropTypes.bool,
      kind: PropTypes.string,
      md5Checksum: PropTypes.string,
      mimeType: PropTypes.string,
      modifiedTime: PropTypes.string,
      originalFilename: PropTypes.string,
      published: PropTypes.bool,
      revisionNumber: PropTypes.number,
      theSameAs: PropTypes.arrayOf(PropTypes.number),
      uploader: PropTypes.shape({
        displayName: PropTypes.string,
      }),
    }),
  ),
  setActive: PropTypes.func.isRequired,
  isSupportedForDiff: PropTypes.bool,
  isDownloadable: PropTypes.bool.isRequired,
  activeRevisionID: PropTypes.string,
  lastRevisionNumber: PropTypes.number,
  addRevision: PropTypes.func.isRequired,
  subscriptionFeatures: PropTypes.shape({
    revisions: PropTypes.bool,
  }).isRequired,
};
export default RevisionsDropdown;
