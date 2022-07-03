import React, { useCallback } from 'react';
import { func, object, string } from 'prop-types';
import cn from 'classnames';
import { Button, ProgressBar } from '@picsio/ui';
import { navigate } from '../../helpers/history';
import localization from '../../shared/strings';
import Tooltip from '../Tooltip';
import * as utils from '../../shared/utils';

import './styles.scss';

const AssetsKeywords = ({
  generateKeywords,
  url,
  team,
  className,
}) => {
  const getProgress = useCallback(
    () => (team?.assetsKeyworded / team?.assetsKeywordedPaid) * 100,
    [team.assetsKeyworded, team.assetsKeywordedPaid],
  );
  const redirect = useCallback(() => navigate(url), [url]);
  return (
    <div className={cn('keywordsBlock', className)}>
      <div className="kyewordsBlock__size">
        <div className="keywords_progressBarTitle">
          <div className="progressBarTitle">{`Available ${utils.formatNumberWithSpaces(team?.assetsKeywordedPaid || 0)} API calls:`}</div>
          <If condition={url}>
            <Button
              className="keywords__buy-more"
              onClick={redirect}
              color="primary"
            >
              Buy more runs
            </Button>
          </If>
        </div>
        <ProgressBar
          used={team?.assetsKeyworded}
          progress={getProgress()}
          left={team?.assetsKeywordedPaid - team?.assetsKeyworded}
        />
        <If condition={generateKeywords}>
          <div className="detailsPanel__title_buttons detailsPanel__keywords_button">
            <Tooltip content={localization.DETAILS.tooltipGenerateKeywords} placement="top">
              <Button
                onClick={generateKeywords}
                variant="contained"
                color="secondary"
                size="md"
              >
                Tag With AI
              </Button>
            </Tooltip>
          </div>
        </If>
      </div>
    </div>
  );
};

AssetsKeywords.defaultProps = {
  generateKeywords: null,
  url: '',
  className: '',
};

AssetsKeywords.propTypes = {
  generateKeywords: func,
  url: string,
  className: string,
  team: object,
};

export default AssetsKeywords;
