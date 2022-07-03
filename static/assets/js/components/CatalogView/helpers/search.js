import { isHaveTeammatePermission } from '../../../store/helpers/user';
import * as UtilsLightboards from '../../../store/utils/lightboards';
import * as UtilsInboxes from '../../../store/utils/inboxes';
import { navigateToRoot } from '../../../helpers/history';

const searchCollection = async (search, props) => {
  // tagId here is required
  // but actually backend search MIGHT work withiut tag
  // this is just frontend problem
  // this restrictions leads us to extra requests to db everywhere when we need to build urls
  // example - notificators
  const { tagId, archived } = search;

  if (archived) {
    return;
  }

  if (!tagId || tagId.length !== 24) {
    navigateToRoot();
    return;
  }

  try {
    props.collectionsActions.setActiveCollection(tagId);
    props.lightboardsActions.setActiveLightboard(null);
    props.inboxesActions.setActive(null);
  } catch (err) {
    navigateToRoot();
    console.error(`Error finding tag ${tagId}`, err);
  }
}

const searchLightboard = async (search, props) => {
  const { lightboardId } = search;

  if (!lightboardId || lightboardId.length !== 24) {
    this.goToRoot();
    return;
  }

  const lightboard = await UtilsLightboards.getLightboardWithId(lightboardId);
  if (!lightboard) {
    this.goToRoot();
    return;
  }

  props.lightboardsActions.setActiveLightboard(lightboardId);
  props.inboxesActions.setActive(null);
}

const searchInbox = async (search, props) => {
  if (!isHaveTeammatePermission('manageInboxes')) {
    this.goToRoot();
    return;
  }

  const { inboxId } = search;

  if (!inboxId || inboxId.length !== 24) {
    this.goToRoot();
    return;
  }

  const inbox = await UtilsInboxes.getInboxWithId(inboxId);
  if (!inbox) {
    this.goToRoot();
    return;
  }

  props.inboxesActions.setActive(inboxId);
  props.lightboardsActions.setActiveLightboard(null);
}

export default {
  searchCollection,
  searchLightboard,
  searchInbox,
}
