import React from 'react';
import { Provider, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cn from 'classnames';
import {
  User,
  DateEmpty,
  Star,
  Filesize,
  File,
  Dropper,
  Time,
  SortAz,
  Copyright,
  OpenInFull,
  HandlePointIcon,
} from '@picsio/ui/dist/icons';
import DropOpener from '../toolbars/DropOpener';
import localization from '../../shared/strings';

// store
import store from '../../store';
import * as actionsCollections from '../../store/actions/collections';
import * as actionsLightboards from '../../store/actions/lightboards';
import DropOpenerSelect from './DropOpenerSelect';
import SortItem from './SortItem';
import { isRouteFiltering } from '../../helpers/history';
import picsioConfig from '../../../../../config';

const sortConfig = {
  alphabetical: { icon: () => <SortAz />, asc: 'A-Z', desc: 'Z-A' },
  uploadTime: { icon: () => <Time />, asc: 'Old first', desc: 'New first' },
  updateTime: { icon: () => <Time />, asc: 'Old first', desc: 'New first' },
  createTime: { icon: () => <DateEmpty />, asc: 'Old first', desc: 'New first' },
  rating: { icon: () => <Star />, asc: 'Stars 0-5', desc: 'Stars 5-0' },
  color: { icon: () => <Dropper />, asc: 'A-Z', desc: 'Z-A' },
  fileSize: { icon: () => <Filesize />, asc: 'Small first', desc: 'Large first' },
  fileType: { icon: () => <File />, asc: 'A-Z', desc: 'Z-A' },
  creator: { icon: () => <User />, asc: 'A-Z', desc: 'Z-A' },
  copyright: { icon: () => <Copyright />, asc: 'A-Z', desc: 'Z-A' },
  custom: { icon: () => <HandlePointIcon /> },
  imageResolution: { icon: () => <OpenInFull />, asc: 'Low first', desc: 'High first' },
};

class ToolbarSort extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortType: { type: 'uploadTime', order: 'desc' },
      subcollectionsSortType: { type: 'alphabetical', order: 'asc' },
      filterIcon: 'uploadTime',
      filterIconCollection: 'alphabetical',
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.sortType && props.sortType !== state.sortType) {
      return {
        sortType: props.sortType,
        filterIcon: sortConfig[props.sortType.type].icon,
      };
    }

    if (
      props.subcollectionsSortType
      && props.subcollectionsSortType !== state.subcollectionsSortType
    ) {
      return {
        subcollectionsSortType: props.subcollectionsSortType,
        filterIconCollection: sortConfig[props.subcollectionsSortType.type].icon,
      };
    }

    return null;
  }

  render() {
    let {
      sortType, subcollectionsSortType, filterIcon, filterIconCollection,
    } = this.state;
    const {
      resetDropdowns,
      isToolbarDropdownOpened,
      changeSort,
      view,
      rootCollectionId,
      collectionsSortTypeUpdating,
      lightboardsSortTypeUpdating,
      inboxesSortTypeUpdating,
    } = this.props;
    const isProofing = picsioConfig.isProofing();
    const isBusy = collectionsSortTypeUpdating || lightboardsSortTypeUpdating || inboxesSortTypeUpdating;
    const { tagId } = this.props.location.query;

    if (typeof sortType !== 'string') {
      filterIcon = sortConfig[sortType.type].icon;
    } else {
      filterIcon = sortConfig[sortType].icon;
    }

    if (typeof subcollectionsSortType !== 'string') {
      filterIconCollection = sortConfig[subcollectionsSortType.type].icon;
    } else {
      filterIconCollection = sortConfig[subcollectionsSortType].icon;
    }

    const sortOrder = sortConfig[sortType.type][sortType.order];
    const sortOrderCollections = sortConfig[subcollectionsSortType.type][subcollectionsSortType.order];

    const { thatsCustomizationTab } = this.props;
    const isCollectionSort = this.props.collectionSort;

    const dropdownContent = (
      <>
        <SortItem
          name="uploadTime"
          sortConfig={sortConfig}
          sort={sortType}
          changeSort={changeSort}
        />
        <SortItem
          name="createTime"
          sortConfig={sortConfig}
          sort={sortType}
          changeSort={changeSort}
        />
        <SortItem
          name="alphabetical"
          sortConfig={sortConfig}
          sort={sortType}
          changeSort={changeSort}
        />
        <SortItem name="rating" sortConfig={sortConfig} sort={sortType} changeSort={changeSort} />
        <SortItem name="color" sortConfig={sortConfig} sort={sortType} changeSort={changeSort} />
        {(tagId === rootCollectionId || isRouteFiltering())
        && !(view === 'select') ? null : (
            <SortItem name="custom" sortConfig={sortConfig} sort={sortType} changeSort={changeSort} disabled={isProofing} />
          )}
        <div className="toolbarDropdownSeparator" />
        <SortItem
          name="updateTime"
          sortConfig={sortConfig}
          sort={sortType}
          changeSort={changeSort}
        />
        <SortItem name="fileSize" sortConfig={sortConfig} sort={sortType} changeSort={changeSort} />
        <SortItem name="fileType" sortConfig={sortConfig} sort={sortType} changeSort={changeSort} />
        <SortItem
          name="imageResolution"
          sortConfig={sortConfig}
          sort={sortType}
          changeSort={changeSort}
        />
        <SortItem name="creator" sortConfig={sortConfig} sort={sortType} changeSort={changeSort} disabled={isProofing} />
        <SortItem
          name="copyright"
          sortConfig={sortConfig}
          sort={sortType}
          changeSort={changeSort}
          disabled={isProofing}
        />
      </>
    );

    const dropdownContentCollectionsSort = (
      <>
        <SortItem
          name="alphabetical"
          sortConfig={sortConfig}
          sort={subcollectionsSortType}
          changeSort={changeSort}
        />
        <SortItem
          name="createTime"
          sortConfig={sortConfig}
          sort={subcollectionsSortType}
          changeSort={changeSort}
        />
        <SortItem
          name="updateTime"
          sortConfig={sortConfig}
          sort={subcollectionsSortType}
          changeSort={changeSort}
        />
      </>
    );

    return (
      <>
        {view ? (
          <DropOpenerSelect
            icon={!isCollectionSort ? filterIcon : filterIconCollection}
            sortName={
              !isCollectionSort
                ? localization.SORT[sortType.type]
                : localization.SORT[subcollectionsSortType.type]
            }
            sortOrder={!isCollectionSort ? sortOrder : sortOrderCollections}
            name="Sort order"
            isToolbarDropdownOpened={isToolbarDropdownOpened}
            resetDropdowns={resetDropdowns}
            additionalClass="dropdownSort"
            thatsCustomizationTab={thatsCustomizationTab}
          >
            {!isCollectionSort ? dropdownContent : dropdownContentCollectionsSort}
          </DropOpenerSelect>
        ) : (
          <DropOpener
            additionalClass={cn('tabletNotVisible dropdownSort', { isBusy })}
            icon={!isCollectionSort ? filterIcon : filterIconCollection}
            sortTypeOrder={!isCollectionSort ? sortType.order : subcollectionsSortType.order}
            name="Sorting"
            left
            isToolbarDropdownOpened={isToolbarDropdownOpened}
            resetDropdowns={resetDropdowns}
          >
            <div>
              <If condition={isBusy}>
                <div className="jobs-status-spinner" />
              </If>
              {dropdownContent}
            </div>
          </DropOpener>
        )}
      </>
    );
  }
}

const ConnectedToolbarSort = connect(
  (state) => ({
    location: state.router.location,
    rootCollectionId: state.collections?.collections?.my._id,
    collectionsSortTypeUpdating: state.collections.sortTypeUpdating,
    lightboardsSortTypeUpdating: state.lightboards.sortTypeUpdating,
    inboxesSortTypeUpdating: state.inboxes.sortTypeUpdating,
  }),
  (dispatch) => ({
    actionsCollections: bindActionCreators(actionsCollections, dispatch),
    actionsLightboards: bindActionCreators(actionsLightboards, dispatch),
  }),
)(ToolbarSort);

export default (props) => (
  <Provider store={store}>
    <ConnectedToolbarSort {...props} />
  </Provider>
);
