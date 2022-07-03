import React from 'react';
import cn from 'classnames';
import Icon from '../Icon';

class NotificationPanel extends React.Component {
  timer = null;

  state = {
    closed: false,
  };

  handleClose = () => {
    this.setState({
      closed: true,
    });
  };

  handleMouseHover = () => {
    if (this.state.closed) {
      this.timer = window.setTimeout(() => {
        this.setState({
          closed: false,
        });
      }, 300);
    }
  };

  handleMouseOut = () => {
    window.clearTimeout(this.timer);
  };

  render() {
    const { props, state } = this;
    const { styles } = this.props;
    let generatedStyle = {};

    if (state.closed) {
      const panelHeight = props.panelHeight === 0 ? props.customRef.current.clientHeight : 0;
      generatedStyle = {
        transform: `translate3d(0, ${-panelHeight + 3}px, 0)`,
        marginBottom: `${-panelHeight + 3}px`,
      };
    } else {
      generatedStyle = styles;
    }

    return (
      <>
        <div
          className={cn('notificationPanel', {
            isClosed: state.closed,
          })}
          onMouseEnter={this.handleMouseHover}
          onMouseLeave={this.handleMouseOut}
          ref={props.customRef}
          style={generatedStyle}
        >
          <div className="picsioDefBtn" onClick={() => this.props.refresh()}>
            <Icon name={props.icon} />
          </div>
          <div className="notificationPanelText">{props.text}</div>
          <span className="btnClose" onClick={this.props.close}>
            <Icon name="close" />
          </span>
        </div>
      </>
    );
  }
}

export default NotificationPanel;
