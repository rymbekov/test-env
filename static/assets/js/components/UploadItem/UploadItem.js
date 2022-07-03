import React, { useCallback, useMemo } from 'react';
import cn from 'classnames';
import {
  func, shape, string, number, arrayOf, objectOf, bool,
} from 'prop-types';
import { Icon } from '@picsio/ui';
import {
  Notification, Close, Retry, AddFileImport, ReplaceFileImport, AddRevisionImport, FolderIcon, Ok,
} from '@picsio/ui/dist/icons';
import localization from '../../shared/strings';
import Tooltip from '../Tooltip';

import './styles.scss';

const UploadItem = ({
  item, className, remove, retry, restore, top, groups,
}) => {
  const fileIcon = useMemo(() => {
    switch (item.action) {
    case 'addRevision':
      return <AddRevisionImport />;
    case 'replaceFile':
      return <ReplaceFileImport />;
    default:
      return <AddFileImport />;
    }
  }, [item.action]);

  const handleRetry = useCallback(() => retry(item.id), [retry, item.id]);
  const handleRemove = useCallback(() => remove([item.id]), [remove, item.id]);
  const handleRemoveGroup = useCallback(() => {
    remove(groups[item.groupPath].map(({ id }) => id));
  }, [groups, item.groupPath, remove]);

  const handleRestore = useCallback((event) => {
    const file = event.target.files[0];
    if (file) restore(item.path, item.id, file);
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
  }, [restore, item.id, item.path]);

  if (item.groupPath) {
    /** Render collection */
    return (
      <div className="importFileItem collectionPath" style={{ top }}>
        <div className="importFileItemHolder">
          <div className="importCell importName">
            <Tooltip content={localization.IMPORT.textCancel} placement="top">
              <span
                className="btnImportItemAction"
                onClick={handleRemoveGroup}
                onKeyPress={handleRemoveGroup}
                tabIndex={0}
                role="button"
              >
                <Icon size="lg"><Close /></Icon>
              </span>
            </Tooltip>
            <span className="iconHolder">
              <Icon size="sm"><FolderIcon /></Icon>
            </span>
            <span className="importItemCurrentName">{item.name}</span>
          </div>
        </div>
      </div>
    );
  }

  /** Render file */
  return (
    <div
      className={cn('importFileItem', {
        error: !!item.error,
        isInProgress: !!item.progress,
        [className]: className,
        isComplete: item.complete,
      })}
      style={{ top }}
    >
      <div className="importFileItemHolder">
        <div className="importItemCell">
          <If condition={!item.complete}>
            <Tooltip content={localization.IMPORT.textCancel} placement="top">
              <span
                className="btnImportItemAction"
                onKeyPress={handleRemove}
                onClick={handleRemove}
                role="button"
                tabIndex={0}
              >
                <Icon size="lg"><Close /></Icon>
              </span>
            </Tooltip>
          </If>
          <If condition={item.complete}>
            <span className="btnImportItemAction statusUploadComlete">
              <Icon size="sm"><Ok /></Icon>
            </span>
          </If>
          {item.error && item.file && (
            <Tooltip content={localization.IMPORT.textRetry} placement="top">
              <span
                className="btnImportItemAction"
                onClick={handleRetry}
                onKeyPress={handleRetry}
                tabIndex={0}
                role="button"
              >
                <Icon size="sm"><Retry /></Icon>
              </span>
            </Tooltip>
          )}
          {!item.error && (
            <span className="iconHolder">
              <Icon size="sm">
                {fileIcon}
              </Icon>
            </span>
          )}
          <span className="importItemCurrentName">{item.name}</span>
          {!item.file && (
            <span className="importItemRestoreFile">
              select file
              <input type="file" onChange={handleRestore} />
            </span>
          )}
        </div>
        <div className="importItemSize">{item.shortSize}</div>
        <If condition={item.progress}>
          <div className="importFileItemProgress" style={{ width: `${item.progress}%` }} />
        </If>
      </div>
      {(item.error) && (
        <div className="importItemError">
          <span className="iconHolder">
            <Icon><Notification /></Icon>
          </span>
          <Tooltip content={item.error?.message} placement="top">
            <span className="importItemCurrentName">
              {item.error?.message}
            </span>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

UploadItem.defaultProps = {
  className: null,
  top: 0,
  retry: Function.prototype,
};

export const itemShape = {
  progress: number,
  name: string,
  error: shape({ message: string }),
  file: shape({ name: string }),
  id: number,
  groupPath: string,
  complete: bool,
};

UploadItem.propTypes = {
  item: shape(itemShape).isRequired,
  groups: objectOf(arrayOf(shape(itemShape))).isRequired,
  remove: func.isRequired,
  restore: func.isRequired,
  retry: func,
  className: string,
  top: number,
};

export default UploadItem;
