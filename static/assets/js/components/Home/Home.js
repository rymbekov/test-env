import localization from '../../shared/strings';
import UiBlocker from '../../services/UiBlocker';
import history from '../../helpers/history';
import * as utils from '../../shared/utils';

const redirectToRoot = (pathname) => {
  UiBlocker.block(localization.SPINNERS.LOADING_COLLECTIONS);
  /** Check recursive search setting */
  const notRecursiveSearch = utils.LocalStorage.get('picsio.recursiveSearch') === false;
  const { rootCollectionId } = window;
  if (pathname === '/' || pathname === '/search' || pathname === '/appmobile') {
    history.replace({
      pathname: '/search',
      search: `?tagId=${rootCollectionId}${notRecursiveSearch ? '&recursive=false' : ''}`,
    });
  }

  UiBlocker.unblock();
};

export default function Home(props) {
  const { pathname } = props.location;
  redirectToRoot(pathname);

  return null;
}
