import React from 'react';
import cn from 'classnames';
import styled from 'styled-components';
import { Checkbox } from '../../UIComponents';
import Icon from '../Icon';

import localization from '../../shared/strings';

class RecursiveSearchPanel extends React.Component {
  timer = null;

  state = {
    visible: false,
    closed: false,
    id: null,
  };

  handleClose = () => {
    this.setState({
      closed: true,
    });
  };

  static getDerivedStateFromProps(nextProps, state) {
    // when recursive search disabled and we change collection, we need hide the panel
    if (nextProps.id !== state.id) {
      if (!nextProps.notRecursiveSearch) {
        return {
          id: nextProps.id,
          visible: false,
        };
      }
      return {
        id: nextProps.id,
      };
    }

    if (nextProps.notRecursiveSearch) {
      return {
        visible: true,
      };
    }

    return null;
  }

  handleMouseHover = () => {
    this.timer = window.setTimeout(() => {
      this.setState(
        {
          closed: false,
        },
        this.props.expand(),
      );
    }, 300);
  };

  handleMouseOut = () => {
    window.clearTimeout(this.timer);
  };

  render() {
    const { props, state } = this;
    const {
      customRef,
      notRecursiveSearch,
      activeCollectionHasChild,
      recursiveSearchPanelCollapse,
      isRecursiveSearchPanelVisible,
      recursiveSearchPanelHeight,
      recursiveSearchToggle,
    } = props;

    return (
      <>
        {activeCollectionHasChild && state.visible && (
          <StyledRecursiveSearchPanel
            className={cn('recursiveSearchPanel', {
              isActive: notRecursiveSearch,
            })}
            onMouseEnter={this.handleMouseHover}
            onMouseLeave={this.handleMouseOut}
            ref={customRef}
            recursiveSearchPanelCollapse={recursiveSearchPanelCollapse}
            isRecursiveSearchPanelVisible={isRecursiveSearchPanelVisible}
            recursiveSearchPanelHeight={recursiveSearchPanelHeight}
            closed={state.closed}
          >
            <Checkbox
              label={
                notRecursiveSearch
                  ? localization.RECURSIVE_SEARCH.labelOnCatalogPanelDontShow
                  : localization.RECURSIVE_SEARCH.labelOnCatalogPanelShow
              }
              value={notRecursiveSearch}
              onChange={recursiveSearchToggle}
              slide
            />
            <span className="btnClose" onClick={this.handleClose}>
              <Icon name="collapse" />
            </span>
          </StyledRecursiveSearchPanel>
        )}
      </>
    );
  }
}

const StyledRecursiveSearchPanel = styled.div`
  transform: ${(props) => (props.closed
    ? `translate3d(0, ${-props.recursiveSearchPanelHeight + 3}px, 0);`
    : props.recursiveSearchPanelCollapse && props.isRecursiveSearchPanelVisible
      ? `translate3d(0, ${-props.recursiveSearchPanelHeight + 3}px, 0)`
      : 'translate3d(0, 0, 0)')}};

  margin-bottom: ${(props) => (props.closed ? `${-props.recursiveSearchPanelHeight + 3}px` : 0)};
`;

export default RecursiveSearchPanel;
