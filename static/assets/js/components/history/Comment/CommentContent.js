import React from 'react';
import PropTypes from 'prop-types';
import localization from '../../../shared/strings';

const CommentContent = (props) => {
  const {
    markers, text, approved, revNumber, content, onClickText,
  } = props;

  let approveText;
  let approveClass;
  if (approved === false) {
    approveText = localization.HISTORY.disapproved;
    approveClass = 'disapproved';
  } else {
    approveText = localization.HISTORY.approved;
    approveClass = 'approved';
  }

  return (
    <div className="itemHistoryList__main__text">
      {markers.length > 0 && (
        <span className="markersComment">
          added <span>visual mark</span>
          {markers.map(({ number }) => (
            <mark key={number}>{number}</mark>
          ))}
        </span>
      )}
      {text === '' && revNumber && (
        <div className="approveStatus">
          {approveText && <span className={approveClass}>{approveText}</span>}{' '}
          {revNumber && <span className="revision">revision {revNumber}</span>}
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: content }} onClick={onClickText} />
    </div>
  );
};

CommentContent.defaultProps = {
  markers: [],
  text: '',
  approved: null,
  revNumber: null,
  content: '',
  onClickText: null,
};
CommentContent.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.number,
    }),
  ),
  text: PropTypes.string,
  approved: PropTypes.bool,
  revNumber: PropTypes.number,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onClickText: PropTypes.func,
};

export default CommentContent;
