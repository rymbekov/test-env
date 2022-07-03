import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@picsio/ui';
import cn from 'classnames';
import { useSelector } from 'react-redux';
import Icon from '../../Icon';
import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import processingReasons from './Configs/processingReasons';
import processingReRunAbility from './Configs/processingReRunAbility';
import Tooltip from '../../Tooltip';

const ProcessingItem = (props) => {
  const { item, visible, reRunParsing } = props;
  const { processing } = useSelector((state) => state.assets.inProgress);

  return (
    <>
      <Choose>
        <When condition={item.status === 'complete' && visible}>
          <div className="detailsProcessingItem">
            <div className="detailsProcessingItemIcon">
              <Icon name={item.icon} />
            </div>
            <div className="detailsProcessingItemRow">
              <div className="detailsProcessingItemRowText">
                {localization.PROCESSING[item.name]}
              </div>
              <div className="detailsProcessingItemRowIcon">
                <Icon name="ok" />
              </div>
            </div>
          </div>
        </When>

        <Otherwise>
          <div className="detailsProcessingItem">
            <div className="detailsProcessingItemIcon">
              <Icon name={item.icon} />
            </div>
            <div className="detailsProcessingItemContent">
              <If condition={['waiting', 'running'].includes(item.status)}>
                <div className="detailsProcessingItemRow">
                  <div className="detailsProcessingItemRowText">
                    {localization.PROCESSING[item.name]}
                  </div>
                  <div className="detailsProcessingItemRowIcon">
                    <span className="indicator" />
                  </div>
                </div>
              </If>

              <If condition={['rejected', 'delayed'].includes(item.status)}>
                <div className="detailsProcessingItemText">
                  {item.errors
                    && item.errors.map((error) => {
                      const itemName = item.name.toUpperCase();
                      if (error === 'BY_ACCOUNT_PLAN_LIMITS') {
                        error = `${error}_${itemName}`;
                      }
                      let processingReasonsError = processingReasons[error] || processingReasons.UNKNOWN;
                      if (error === 'BY_FILE_TYPE') {
                        processingReasonsError = processingReasons[`${error}_${itemName}`] || processingReasons[error];
                      }
                      return (
                        <div className="detailsProcessingItemRow" key={error}>
                          <div className="detailsProcessingItemRowText">
                            {processingReasonsError()}
                          </div>
                          <div className="detailsProcessingItemRowIcon">
                            <Icon name="attention" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </If>

              <If condition={item.status === 'failed'}>
                <Choose>
                  <When condition={item.errorCode}>
                    <div className="detailsProcessingItemText">
                      <div className="detailsProcessingItemRow">
                        <div className="detailsProcessingItemRowText">
                          {processingReasons[item.name][item.errorCode] || processingReasons[item.name].UnknownError}
                        </div>
                        <If
                          condition={
                            (item.name === 'metadating'
                              || item.name === 'replicating'
                              || item.name === 'thumbnailing')
                            && processingReRunAbility[item.name][item.errorCode]
                          }
                        >
                          <Tooltip content={localization.PROCESSING.rerun[item.name]}>
                            <IconButton
                              buttonSize="default"
                              className={cn('detailsProcessingItemButton', {
                                inProgress: processing,
                              })}
                              color="default"
                              component="button"
                              disabled={processing}
                              id={`rerunProcessing${item.name}`}
                              onClick={() => reRunParsing(item.name)}
                              size="md"
                            >
                              <Icon name="sync" />
                            </IconButton>
                          </Tooltip>
                        </If>
                        <div className="detailsProcessingItemRowIcon">
                          <Icon name="close" />
                        </div>
                      </div>
                    </div>
                  </When>
                  <Otherwise>
                    <div className="detailsProcessingItemText">
                      <div className="detailsProcessingItemRow">
                        <div
                          className="detailsProcessingItemRowText"
                          dangerouslySetInnerHTML={{
                            __html: utils.sanitizeXSS(localization.PROCESSING.failed[item.name]),
                          }}
                        />
                        <div className="detailsProcessingItemRowIcon">
                          <Icon name="close" />
                        </div>
                      </div>
                    </div>
                  </Otherwise>
                </Choose>
              </If>
            </div>
          </div>
        </Otherwise>
      </Choose>
    </>
  );
};

ProcessingItem.propTypes = {
  visible: PropTypes.bool,
  item: PropTypes.object,
  reRunParsing: PropTypes.func.isRequired,
};

export default ProcessingItem;
