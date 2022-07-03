import React from 'react';
import cn from 'classnames';

import { permissions } from '@picsio/db/src/constants';
import { Icon } from '@picsio/ui';
import {
  Delete,
  StarBorder,
  SavedSearchTeam,
  SavedSearchUser,
} from '@picsio/ui/dist/icons';
import Logger from '../../../services/Logger';

import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';

import { getRoleById } from '../../../store/reducers/roles';
import TreeButton from '../../TreeButton';

export default class Item extends React.Component {
  userId = this.props.user._id;

  btnCLicked = false;

  itemsPerPage = 100;

  observerOptions = {
    root: document.querySelector('.wrapperSavedsavedSearchesTree'),
    rootMargin: '0px',
    threshold: 1,
  };

  liStyle = { paddingLeft: 36 };

  $item = React.createRef();

  state = {
    isOpen: this.props.node.isOpen,
    page: 1,
  };

  componentDidMount() {
    this.initObserver();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (
      nextProps.node.nodes
      && nextProps.node.nodes.length
      && (!props.node.nodes || props.node.nodes.length !== nextProps.node.nodes.length)
    ) {
      if (!this.isInitializeIntersectionObserver) this.initObserver();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { node } = this.props;

    // if closed
    if (
      (prevState.isOpen && !this.state.isOpen)
      || !node.nodes
      || node.nodes.length < 1
      || this.itemsPerPage * this.state.page >= node.nodes.length
    ) {
      this.removeObserver();
    } else if (node.nodes && node.nodes.length && !this.isInitializeIntersectionObserver) {
      this.initObserver();
    }
  }

  componentWillUnmount() {
    this.removeObserver();
  }

  generateTitleAndBtns = () => {
    const { handlers, node } = this.props;
    let title = node.name;
    const isTeamSearch = Boolean(node.teamId);
    let buttons = null;

    const { teammateRoleId } = this.props.user.team;
    const role = teammateRoleId && getRoleById(teammateRoleId);
    const isRootAndHasAllowedCollections = role && role.allowedCollections && role.allowedCollections.length && node.path === 'root';

    const hasRemovePermission = !isTeamSearch || !role || role.permissions[permissions.manageTeamSavedSearches];

    if (['favorites'].includes(node.path) || isRootAndHasAllowedCollections) {
      title = <span className="collectionTextValue">{decodeURIComponent(title)}</span>;
      return { title, buttons };
    }

    const btns = [];

    // readonly -> can't delete
    // dynamic -> overall can't do anything

    // on delete button rely on readonly and dynamic
    // on add to fav rely on dynamic

    /** Remove */
    if (hasRemovePermission && handlers.remove && !node.root && node?.nodes?.length <= 0 && (!node?.readonly || !node?.dynamic)) {
      btns.push({
        icon: () => <Delete />,
        additionalClassName: 'btnRemoveFolder',
        tooltip: localization.SAVEDSEARCHESTREE.textDeleteSearch,
        onClick: this.handleRemove,
      });
    }

    /** Favorites */
    if (handlers.favorite && !node.root && node?.nodes?.length <= 0 && !node?.dynamic) {
      btns.push(
        node.favorites && node.favorites.length && node.favorites.includes(this.userId) > 0
          ? {
            icon: () => <StarBorder />,
            additionalClassName: 'yellow',
            tooltip: localization.SAVEDSEARCHESTREE.textRemoveFromFavoritesSearch,
            onClick: (event) => {
              this.handleAddToFavorites(event);
              Logger.log('User', 'SavedSearchesPanelRemoveFromFav');
            },
          }
          : {
            icon: () => <StarBorder />,
            tooltip: localization.SAVEDSEARCHESTREE.textAddToFavoritesSearch,
            onClick: (event) => {
              this.handleAddToFavorites(event);
              Logger.log('User', 'SavedSearchesPanelAddToFav');
            },
          },
      );
    }

    title = <span className="collectionTextValue">{decodeURIComponent(title)}</span>;
    buttons = (
      <div className="btnsManageCollection leftShadow">
        {btns.map((btn) => (
          <TreeButton
            key={btn.icon}
            icon={btn.icon}
            className={btn.className}
            additionalClassName={btn.additionalClassName}
            tooltip={btn.tooltip}
            onClick={btn.onClick}
          />
        ))}
      </div>
    );
    return { title, buttons };
  };

  handleAddToFavorites = (event) => {
    const { node } = this.props;
    event.stopPropagation();
    const value = !(
      node.favorites
      && node.favorites.length
      && node.favorites.includes(this.userId) > 0
    );
    this.props.handlers.favorite(node._id, node.name, value, this.userId);
  };

  handleRemove = (event) => {
    Logger.log('User', 'SavedSearchesPanelDeleteSearch');
    const { _id, name } = this.props.node;
    event.stopPropagation();
    this.props.handlers.remove(_id, name);
  };

  /**
   * @param {MouseEvent} event
   */
  onClickArrow = (event) => {
    event.stopPropagation();

    const { node } = this.props;

    function setCookie() {
      if (node.root) {
        const cookieName = node.path;
        utils.setCookie(`picsio.savedSearchedTree.${cookieName}.open`, !node.isOpen);
      }
    }
    this.setState((state) => ({ isOpen: !state.isOpen }), setCookie);

    if (!node.nodes) {
      this.props.handlers.arrow(this.props.node._id);
    }
  };

  stopPropagation = (event) => event.stopPropagation();

  onMouseOver = () => {
    this.$item.current.classList.add('hover');
  };

  onMouseLeave = () => {
    this.$item.current.classList.remove('hover');
  };

  onClickItem = (event) => {
    const { node } = this.props;
    if (node.root || node?.nodes?.length > 0) return this.onClickArrow(event);

    this.props.handlers.item(this.props.node._id, this.props.node.data);
    if (!this.state.isOpen && this.props.node.hasChild) {
      this.onClickArrow(event);
    }
  };

  setRef = ($element) => (this.$li = $element);

  initObserver = () => {
    if (!this.$li) return;

    this.isInitializeIntersectionObserver = true;
    const onChange = (changes) => {
      changes[0].intersectionRatio === 1 && this.setState({ page: this.state.page + 1 });
    };

    this.setState({ page: 1 }, () => {
      this.intersectionObserver = new IntersectionObserver(onChange, this.observerOptions);
      this.intersectionObserver.observe(this.$li);
    });
  };

  removeObserver = () => {
    if (this.intersectionObserver && this.isInitializeIntersectionObserver) {
      this.intersectionObserver.disconnect();
      this.isInitializeIntersectionObserver = false;
      this.state.page = 1; // no rerender here !
    }
  };

  render() {
    const { props, state } = this;
    const { title, buttons } = this.generateTitleAndBtns();
    const itemClassName = cn('nameFolder', {
      openFolderList: state.isOpen,
      act: props.activeSavedSearch.includes(props.node._id),
      renaming: props.node.isBusy,
      disabled: props.node.isFetching,
    });
    const arrowClassName = cn('arrowFolder', {
      hide: !props.node.nodes || !props.node.nodes.length,
    });

    let { lvl } = props;
    lvl && lvl--;

    return (
      <li id={props.id}>
        <span
          className={itemClassName}
          onClick={this.onClickItem}
          style={{ paddingLeft: 36 + lvl * 15 }}
          onMouseOver={this.onMouseOver}
          onMouseLeave={this.onMouseLeave}
          ref={this.$item}
        >
          <span className="iconHolder">
            <Icon>
              <Choose>
                <When condition={props.node.teamId?.length > 0}>
                  <SavedSearchTeam />
                </When>
                <Otherwise>
                  <SavedSearchUser />
                </Otherwise>
              </Choose>
            </Icon>
          </span>
          <span
            className={arrowClassName}
            onClick={this.onClickArrow}
            style={{ left: 22 + lvl * 15 }}
          />
          {buttons}
          {title}
        </span>
        {/* Children */}
        {props.node.nodes?.length > 0 && (
          <ul>
            {props.node.nodes.slice(0, this.itemsPerPage * state.page).map((node) => (
              <Item
                key={node._id}
                node={node}
                allKeywords={props.allKeywords}
                activeSavedSearch={props.activeSavedSearch}
                handlers={props.handlers}
                lvl={props.lvl + 1}
                user={props.user}
              />
            ))}
            {this.itemsPerPage * state.page < props.node.nodes.length && (
              <li style={this.liStyle} ref={this.setRef}>
                {localization.SPINNERS.LOADING}
              </li>
            )}
          </ul>
        )}
      </li>
    );
  }
}
