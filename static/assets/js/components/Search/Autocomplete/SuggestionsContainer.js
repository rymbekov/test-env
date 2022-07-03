import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Icon } from '@picsio/ui';
import {
  AutoSuggestDown,
  AutoSuggestUp,
  AutoSuggestEnter,
} from '@picsio/ui/dist/icons/';
import WithSkeletonTheme from '../../WithSkeletonTheme';

const SuggestionsContainer = (
  { containerProps, children, query }, loading, suggestionPlaceholder,
) => (
  <div {...containerProps}>
    <div className="react-autosuggest__list">{children}</div>
    <If condition={loading && !children}>
      <WithSkeletonTheme>
        <div className="react-autosuggest__loading react-autosuggest__list">
          <div className="react-autosuggest__section-container react-autosuggest__section-container--first">
            <div className="react-autosuggest__section-title">
              <div>Recent Searches</div>
            </div>
            <ul role="listbox" className="react-autosuggest__suggestions-list">
              <li className="react-autosuggest__suggestion">
                <Skeleton width={175} />
              </li>
              <li className="react-autosuggest__suggestion">
                <Skeleton width={185} />
              </li>
              <li className="react-autosuggest__suggestion">
                <Skeleton width={170} />
              </li>
              <li className="react-autosuggest__suggestion">
                <Skeleton width={175} />
              </li>
              <li className="react-autosuggest__suggestion">
                <Skeleton width={185} />
              </li>
            </ul>
          </div>
        </div>
      </WithSkeletonTheme>
    </If>
    <If condition={!loading && suggestionPlaceholder}>
      <div className="react-autosuggest__placeholder">
        {suggestionPlaceholder}
      </div>
    </If>
    <div className="react-autosuggest__footer">
      <div className="react-autosuggest__footer-item">
        <Icon>
          <AutoSuggestDown />
        </Icon>
        <Icon>
          <AutoSuggestUp />
        </Icon>
        <span>to navigate</span>
      </div>
      <div className="react-autosuggest__footer-item">
        <Icon>
          <AutoSuggestEnter />
        </Icon>
        <span>search</span>
      </div>
      <div className="react-autosuggest__footer-item">esc to dismiss</div>
    </div>
  </div>
);

export default SuggestionsContainer;
