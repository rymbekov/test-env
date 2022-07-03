import React, { useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import MapView from '../MapView';
import DetailsSideBar from '../details';
import { setMobileMainScreenPanel, openDetails } from '../../store/actions/main';
import ImportComponent from '../import';
import DownloadListComponent from '../DownloadList';
import CatalogView from '../CatalogView';
import MobileTrees from '../MobileTrees';
import MobileToolbarCatalogTop from '../toolbars/MobileToolbarCatalogTop';
import MobileToolbarCatalogBottom from '../toolbars/MobileToolbarCatalogBottom';
import MobileToolbarSelectedAssetsTop from '../toolbars/MobileToolbarSelectedAssetsTop';
import Swipeable from '../Swipeable';
import MobileAdditionalPanel from '../MobileAdditionalPanel';

export default function MobileCatalog(props) {
  const { children, search } = props;
  const dispatch = useDispatch();
  const {
    mobileMainScreenPanelActive,
    mobileAdditionalPanelActive,
    mobileMainScreenSlideWidth,
    catalogViewMode,
    isDetailsOpen,
  } = useSelector((state) => state.main);
  const {
    selectedItems,
  } = useSelector((state) => state.assets);

  useEffect(() => {
    if (!isDetailsOpen) {
      dispatch(openDetails());
    }
  }, [isDetailsOpen, dispatch]);

  const handleSwipeLeft = (eventData) => {
    const { absX, dir } = eventData;
    if (absX > 70 && dir === 'Left') {
      if (mobileMainScreenPanelActive === 'details') return;

      if (mobileMainScreenPanelActive === 'trees') {
        dispatch(setMobileMainScreenPanel('catalog'));
      } else {
        dispatch(setMobileMainScreenPanel('details'));
      }
    }
  };

  const handleSwipeRight = (eventData) => {
    const { absX, dir } = eventData;
    if (absX > 70 && dir === 'Right') {
      if (mobileMainScreenPanelActive === 'trees') return;

      if (mobileMainScreenPanelActive === 'details') {
        dispatch(setMobileMainScreenPanel('catalog'));
      } else {
        dispatch(setMobileMainScreenPanel('trees'));
      }
    }
  };

  return (
    <div className="mobileApp">
      <StyledSwipeable
        className="mobileCatalogSwipeable mobileCatalogWrapper"
        onSwipedLeft={handleSwipeLeft}
        onSwipedRight={handleSwipeRight}
        mobileMainScreenSlideWidth={mobileMainScreenSlideWidth}
      >
        <MobileTrees />
        <AppCatalogWrapper
          isCatalogNotActive={mobileMainScreenPanelActive !== 'catalog'}
          className="appCatalogWrapper"
        >
          <CSSTransition
            unmountOnExit
            in={mobileMainScreenPanelActive !== 'catalog'}
            timeout={300}
            classNames="fade"
          >
            <CatalogOverlay onClick={() => dispatch(setMobileMainScreenPanel('catalog'))} />
          </CSSTransition>
          <MobileToolbarCatalogTop />
          {/* <CSSTransition
            unmountOnExit
            in={selectedItems.length > 0}
            timeout={300}
            classNames="fade"
          >
            <MobileToolbarSelectedAssetsTop />
          </CSSTransition> */}
          <If condition={selectedItems.length > 0}>
            <MobileToolbarSelectedAssetsTop />
          </If>
          <div className="appCatalog">
            <Choose>
              <When condition={catalogViewMode === 'geo'}>
                <MapView />
              </When>
              <Otherwise>
                <CatalogView isMobileView search={search} />
              </Otherwise>
            </Choose>
          </div>
        </AppCatalogWrapper>
        <div className="mobileDetails">
          <DetailsSideBar
            panelName="right"
            textareaHeightNameLS="picsio.detailsDescriptionHeight"
          />
        </div>
      </StyledSwipeable>

      <If condition={mobileAdditionalPanelActive !== 'Home'}>
        <MobileAdditionalPanel panel={mobileAdditionalPanelActive} />
      </If>

      <MobileToolbarCatalogBottom />
      <ImportComponent />
      <DownloadListComponent />
      {children}
    </div>
  );
}

const StyledSwipeable = styled(Swipeable)`
  margin-left: calc(-100vw + 50px);
  width: calc(300% - 100px);
  transform: ${(props) => `translate3d(${props.mobileMainScreenSlideWidth}, 0, 0)`};
`;

const AppCatalogWrapper = styled.div`
  position: relative;
`;

const CatalogOverlay = styled.div`
  position: absolute;
  top: 50px;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  transition: opacity 0.3s ease;
  background-color: rgba(0, 0, 0, 0.1);
`;
