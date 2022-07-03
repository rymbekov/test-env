import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowPrev,
  ArrowNext,
  DownloadList,
  Burger,
  Info,
} from '@picsio/ui/dist/icons';
import { setMobileMainScreenPanel, toggleDownloadList } from '../../store/actions/main';
import { isHaveTeammatePermission } from '../../store/helpers/user';
import ErrorBoundary from '../ErrorBoundary';
import Logger from '../../services/Logger';
import Button from './Button';
import Breadcrumbs from '../Breadcrumbs';
import Group from './Group';
import InviteButton from './InviteButton';

export default function MobileToolbarTop() {
  const dispatch = useDispatch();
  const { mobileMainScreenPanelActive, downloadListOpened, importOpened } = useSelector(
    (state) => state.main,
  );
  const { items: downloadListItems } = useSelector((state) => state.downloadList);

  const toggleMainPanels = (panelName) => {
    const newPanelName = mobileMainScreenPanelActive === panelName ? 'catalog' : panelName;
    dispatch(setMobileMainScreenPanel(newPanelName));
  };

  return (
    <div className="toolbar toolbarCatalogTop">
      <Group>
        <Button
          icon={mobileMainScreenPanelActive === 'trees' ? () => <ArrowNext /> : () => <Burger />}
          isActive={mobileMainScreenPanelActive === 'trees'}
          onClick={() => toggleMainPanels('trees')}
        />
      </Group>
      <Group additionalClass="wrapperBreadcrumbs">
        <ErrorBoundary>
          <Breadcrumbs />
        </ErrorBoundary>
      </Group>
      <Group />
      <Group>
        <If condition={(downloadListItems.length > 0 || downloadListOpened)}>
          <Button
            id="button-downloadList"
            icon={() => <DownloadList />}
            onClick={() => {
              Logger.log('User', 'DonwloadPanelShowClicked');
              dispatch(toggleDownloadList());
            }}
            additionalClass={importOpened ? 'disabled' : downloadListOpened ? 'active' : null}
            counter={downloadListItems.length}
          />
        </If>
        <If condition={isHaveTeammatePermission('manageTeam')}>
          <InviteButton />
        </If>
        <Button
          icon={mobileMainScreenPanelActive === 'details' ? () => <ArrowPrev /> : () => <Info />}
          isActive={mobileMainScreenPanelActive === 'details'}
          onClick={() => toggleMainPanels('details')}
        />
      </Group>
    </div>
  );
}
