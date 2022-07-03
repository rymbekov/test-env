import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';
import {
  Tab, Tabs, TabList, TabPanel,
} from 'react-tabs';
import styled from 'styled-components';
import { Icon } from '@picsio/ui';
import {
  Archive,
  Collections,
  Inbox,
  Label as Keyword,
  Lamp,
  SavedSearch,
  Message,
} from '@picsio/icons';
import { changeTree } from '../../store/actions/main';
import { checkUserAccess } from '../../store/helpers/user';

import CollectionsTree from '../collectionsTree';
import KeywordsTree from '../KeywordsTree';
import SavedSearchesTree from '../savedSearchesTree';
import LightboardsTree from '../lightboardsTree';
import InboxTree from '../InboxTree';
import ArchiveTree from '../Archive';
import HelpButton from '../toolbars/HelpButton';

const trees = ['collections', 'keywords', 'savedSearches', 'lightboards', 'inbox', 'archive'];

export default function MobileTrees(props) {
  const dispatch = useDispatch();
  const { openedTree } = useSelector((state) => state.main);
  const { permissions } = useSelector((state) => state.user.role);
  const { subscriptionFeatures } = useSelector((state) => state.user);
  const [value, setValue] = React.useState(0);
  const isAllowedArchive = checkUserAccess('subscriptions', 'archive') && checkUserAccess('permissions', 'viewArchive');

  const handleChange = (index, lastIndex) => {
    if (index === lastIndex) return;
    setValue(index);
    dispatch(changeTree(trees[index] || 'collections'));
  };

  useEffect(() => {
    const activeTreeIndex = trees.findIndex((item) => item === openedTree);

    if (activeTreeIndex > 0) {
      setValue(activeTreeIndex);
    }
  }, [openedTree]);

  return (
    <Tabs className="mobileTrees" selectedIndex={value} onSelect={handleChange}>
      <TabList className="toolbar toolbarMobileTrees" value={value} onChange={handleChange}>
        <ToolbarGroup className="toolbarGroup">
          <Tab className={cn('toolbarButton', { active: openedTree === trees[0] })}>
            <Icon size="lg" color="inherit">
              <Collections />
            </Icon>
          </Tab>
          <Tab className={cn('toolbarButton', { active: openedTree === trees[1] })}>
            <Icon size="lg" color="inherit">
              <Keyword />
            </Icon>
          </Tab>
          <Tab className={cn('toolbarButton', { active: openedTree === trees[2] })}>
            <Icon size="xl" color="inherit">
              <SavedSearch />
            </Icon>
          </Tab>
          <Tab className={cn('toolbarButton', { active: openedTree === trees[3] })}>
            <Icon size="xl" color="inherit">
              <Lamp />
            </Icon>
          </Tab>
          <If condition={permissions.manageInboxes}>
            <Tab className={cn('toolbarButton', { active: openedTree === trees[4] })}>
              <Icon size="lg" color="inherit">
                <Inbox />
              </Icon>
            </Tab>
          </If>
          <If condition={isAllowedArchive}>
            <Tab className={cn('toolbarButton', { active: openedTree === trees[5] })}>
              <Icon size="xl" color="inherit">
                <Archive />
              </Icon>
            </Tab>
          </If>
        </ToolbarGroup>
        <ToolbarGroup className="toolbarGroup">
          <HelpButton
            id="button-helpCatalogView"
            icon="question"
            tooltipPosition="left"
            component="catalogView"
          />
          <If condition={subscriptionFeatures.chatSupport}>
            <div
              className="toolbarButton"
              id="itemliveSupport"
              onClick={function () {
                window.dispatchEvent(new Event('toolbar:ui:liveSupport'));
              }}
            >
              <span className="toolbarCounter liveSupportCounter" />
              <Icon size="lg" color="inherit">
                <Message />
              </Icon>
            </div>
          </If>
        </ToolbarGroup>
      </TabList>
      <TabPanel className="mobileTreesPanel" value={value} index={0}>
        <CollectionsTree />
      </TabPanel>
      <TabPanel className="mobileTreesPanel" value={value} index={1}>
        <KeywordsTree />
      </TabPanel>
      <TabPanel className="mobileTreesPanel" value={value} index={2}>
        <SavedSearchesTree />
      </TabPanel>
      <TabPanel className="mobileTreesPanel" value={value} index={3}>
        <LightboardsTree />
      </TabPanel>
      <If condition={permissions.manageInboxes}>
        <TabPanel className="mobileTreesPanel" value={value} index={4}>
          <InboxTree />
        </TabPanel>
      </If>
      <If condition={isAllowedArchive}>
        <TabPanel className="mobileTreesPanel" value={value} index={5}>
          <ArchiveTree />
        </TabPanel>
      </If>
    </Tabs>
  );
}

const ToolbarGroup = styled.div`
  flex-direction: column;
`;
