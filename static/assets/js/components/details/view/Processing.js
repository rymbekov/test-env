import React from 'react';
import { array } from 'prop-types';
import ProcessingItem from './ProcessingItem';

class Processing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      completed: this.getCompleted(this.props.data) || [],
    };
  }

  getCompleted = (items) => items.map((item) => (item.status === 'complete' ? item.name : null)).filter(Boolean);

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      const completed = this.getCompleted(this.props.data);
      if (
        this.props.ids[0] !== prevProps.ids[0]
        || this.props.ids.length !== prevProps.ids.length
      ) {
        this.setState({ completed });
      } else if (completed !== this.state.completed) {
        if (this.timer) {
          return;
        }
        this.timer = setTimeout(() => {
          this.setState({ completed });
          this.timer = 0;
        }, 3000);
      }
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  clearTimer = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
  };

  render() {
    const { props, state } = this;

    return props.data.length > 0 ? (
      <div data-qa="details-processing" className="detailsProcessing">
        {props.data.map((item) => {
          if (item.status === 'complete' && state.completed.includes(item.name)) return null;
          if (item.status === 'skipped' || !item.status) return null;
          if (['rejected', 'delayed'].includes(item.status) && !item.errors) return null;

          return (
            <ProcessingItem
              reRunParsing={props.reRunParsing}
              key={item.name}
              item={item}
              visible={!state.completed.includes(item.name)}
            />
          );
        })}
      </div>
    ) : null;
  }
}

Processing.propTypes = {
  data: array,
};

export default Processing;
