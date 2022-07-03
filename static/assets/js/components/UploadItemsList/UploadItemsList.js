import React from 'react';
import {
  func, objectOf, arrayOf, shape, bool, number,
} from 'prop-types';
import cn from 'classnames';
import UploadItem from '../UploadItem';
import { itemShape } from '../UploadItem/UploadItem';
import virtualizedList from '../../helpers/uploadVirtualizedList';

import './styles.scss';

class UploadItemsList extends React.Component {
  state = {
    styles: [],
    wrapperHeight: 0,
    flatGroups: [],
    groups: null,
    totalFilesCount: 0,
    filesCompleted: 0,
    groupsLength: 0,
    topItemIndex: 0,
    bottomItemIndex: 100,
    errorsCount: 0,
  };

  static getDerivedStateFromProps(props, state) {
    if (
      props.isImportPanelShow
      && (props.filesCompleted !== state.filesCompleted
        || props.errorsCount !== state.errorsCount
        || props.totalFilesCount !== state.totalFilesCount
        || Object.keys(props.groups).length !== state.groupsLength
        || props.groups !== state.groups)
    ) {
      const {
        flatGroups,
        wrapperHeight,
        styles,
      } = virtualizedList(props.groups, props.showCompleted);
      return {
        styles,
        wrapperHeight,
        flatGroups,
        groups: props.groups,
        errorsCount: props.errorsCount,
        totalFilesCount: props.totalFilesCount,
        filesCompleted: props.filesCompleted,
        groupsLength: Object.keys(props.groups).length,
      };
    }
    return null;
  }

  closestValue = (array, value) => {
    let result; let
      lastDelta;

    array.some((item) => {
      const delta = Math.abs(value - item);
      if (delta >= lastDelta) {
        return true;
      }
      result = item;
      lastDelta = delta;
    });
    return result;
  };

  handleScroll = (event) => {
    const { scrollTop } = event.target;
    const holderHeight = event.target.offsetHeight;
    const topItem = this.closestValue(this.state.styles, scrollTop);
    const bottomItem = this.closestValue(this.state.styles, holderHeight + scrollTop);
    this.setState((state) => ({
      topItemIndex: state.styles.findIndex((item) => item === topItem),
      bottomItemIndex: state.styles.findIndex((item) => item === bottomItem),
    }));
  };

  render() {
    const {
      flatGroups, groups, wrapperHeight, topItemIndex, bottomItemIndex,
    } = this.state;
    const {
      isImportPanelShow, retry, restoreFile, remove,
    } = this.props;

    return (
      <div
        className={cn('importItemsWrapper', { importItemsWrapperHidden: !wrapperHeight })}
        onScroll={this.handleScroll}
      >
        <div className="importItemsHolder" style={{ height: wrapperHeight }}>
          <If condition={isImportPanelShow}>
            {flatGroups.slice(topItemIndex, bottomItemIndex + 1).map((item, index) => (
              <UploadItem.Item
                key={item.id}
                className={!(index % 2) ? 'odd' : null}
                item={item}
                restore={restoreFile}
                retry={retry}
                remove={remove}
                top={item.top}
                groups={groups}
              />
            ))}
          </If>
        </div>
      </div>
    );
  }
}

UploadItemsList.defaultProps = {
  errorsCount: 0,
  totalFilesCount: 0,
  showCompleted: false,
  filesCompleted: 0,
  retry: Function.prototype,
};

UploadItemsList.propTypes = {
  groups: objectOf(arrayOf(shape(itemShape))).isRequired,
  remove: func.isRequired,
  restoreFile: func.isRequired,
  isImportPanelShow: bool.isRequired,
  retry: func,
  filesCompleted: number,
  totalFilesCount: number,
  errorsCount: number,
  showCompleted: bool,
};

export default UploadItemsList;
