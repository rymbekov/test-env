import React, {
  useEffect, useState, useCallback, useRef,
} from 'react';
import PropTypes from 'prop-types';
import _isEmpty from 'lodash/isEmpty';
import { bindActionCreators } from 'redux';
import { Button } from '@picsio/ui';
import { QuestionIcon } from '@picsio/ui/dist/icons';
import Tooltip from '../../Tooltip';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import store from '../../../store';
import * as Api from '../../../api/team';
import Dialogs from '../../../ui/dialogs';
import DialogRadios from '../../dialogRadios';
import Spinner from '../../spinner';
import * as utils from '../../../shared/utils';
import { isHaveTeammatePermission } from '../../../store/helpers/user';
import { getKeywords } from '../../../store/actions/keywords';
import { removeAllKeywords } from '../../../store/actions/assets';
import AssetsKeywords from '../../AssetsKeywords';
import { showDialog } from '../../dialog';
import { Select, Checkbox } from '../../../UIComponents';
import { keywordsRelevancePercentage, keywordsCount, keywordingLocales } from '../configs';

const getKeywordsAction = bindActionCreators({ getKeywords }, store.dispatch).getKeywords;
const removeAllKeywordsFromAssetsAction = bindActionCreators({ removeAllKeywords }, store.dispatch).removeAllKeywords;

const calculateKeywordsSumm = (pricePer1000Keywords) => +pricePer1000Keywords / 100;

const AIKeywords = (props) => {
  const {
    subscriptionFeatures, user, buyKeywords, addCard, userActions,
  } = props;
  const inputFileRef = useRef(null);
  const [keywordCallAmount, setKeywordCallAmount] = useState(keywordsCount[0].value);
  const keywordingLocale = user.team?.policies?.keywordingLocale || 'en';
  const autogenerating = !!user.team?.policies?.autogenerateKeywords;
  const relevance = Number(user.team?.policies?.keywordsRelevance) || 0;

  const { pricePer1000Keywords } = subscriptionFeatures;
  const summ = calculateKeywordsSumm(pricePer1000Keywords);

  const getPrice = () => {
    switch (keywordCallAmount) {
    case 1000:
      return subscriptionFeatures.pricePer1000Keywords / 100;
    case 2000:
      return subscriptionFeatures.pricePer1000Keywords * 2 / 100;
    case 5000:
      return subscriptionFeatures.pricePer1000Keywords * 5 / 100;
    case 10000:
      return subscriptionFeatures.pricePer1000Keywords * 10 / 100;
    case 15000:
      return subscriptionFeatures.pricePer1000Keywords * 15 / 100;
    case 20000:
      return subscriptionFeatures.pricePer1000Keywords * 20 / 100;
    case 50000:
      return subscriptionFeatures.pricePer1000Keywords * 50 / 100;
    default:
      return subscriptionFeatures.pricePer1000Keywords * 100 / 100;
    }
  };

  useEffect(() => {
    setKeywordCallAmount(keywordsCount[0].value);
  }, []);

  const handleAddCard = useCallback(() => {
    addCard('add');
  }, [addCard]);

  const handleBuyKeywords = useCallback(() => {
    if (_isEmpty(user.customer.card)) {
      handleAddCard();
    }
    buyKeywords(keywordCallAmount);
  }, [buyKeywords, keywordCallAmount, handleAddCard, user.customer.card]);

  const handleUploadChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (file.type !== 'text/plain' || file.name.length < 5 || file.name.slice(-4) !== '.txt') {
      Logger.log('UI', 'UploadDictionaryOnlyTxtDialog');
      showDialog({
        title: localization.TEAMMATES.titleInvalidFileType,
        text: localization.TEAMMATES.textOnlyTXT,
        textBtnOk: localization.DIALOGS.btnOk,
        textBtnCancel: null,
      });
    } else {
      let spinner;
      Logger.log('UI', 'UploadDictionaryDialog');
      new DialogRadios({
        title: localization.TEAMMATES.titleUploadDictionary,
        items: [
          {
            label: localization.TEAMMATES.labelMerge,
            value: 'merge',
            checked: true,
            classList: ['mergeKeywords'],
            description: localization.TEAMMATES.textAddKeywords,
          },
          {
            label: localization.TEAMMATES.labelReplace,
            value: 'replace',
            classList: ['replaceKeywords'],
            description: localization.TEAMMATES.textReplaceKeywords,
          },
        ],
        cancelName: localization.DIALOGS.btnCancel,
        okName: localization.TEAMMATES.btnUpload,
        onCancel() {
          Logger.log('User', 'UploadDictionaryDialogCancel');
          spinner && spinner.destroy();
        },
        onOk(value) {
          Logger.log('User', 'UploadDictionaryDialogOk');
          spinner = new Spinner({
            parentEl: document.querySelector('.pageContent'),
            classList: ['partial'],
            styleList: {
              'z-index': '11',
            },
          });

          const data = new FormData();
          const option = value;
          data.append('dictionary', file);
          data.append('action', option);

          Api.uploadDictionary({
            data,
            cache: false,
            contentType: false,
            processData: false,
          })
            .then((res) => {
              const created = res.created === res.total ? 'all' : res.created === 0 ? 'none' : res.created;
              new Dialogs.Text({
                title: localization.TEAMMATES.titleDictionaryUploaded,
                html: localization.TEAMMATES.textWeFoundInFile({ total: res.total, created }),
                dialogConfig: {
                  textBtnCancel: null,
                },
              });

              if (option === 'replace') {
                removeAllKeywordsFromAssetsAction();
              }
              /** @Hardcode: need some time for replication keywords in db to secondary nodes */
              setTimeout(() => {
                /** get all keywords */
                getKeywordsAction();
                spinner.destroy();
              }, 5000);
            })
            .catch((err) => {
              new Dialogs.Text({
                title: localization.TEAMMATES.titleDictionaryUploadFailed,
                html: utils.getDataFromResponceError(err, 'msg') || localization.TEAMMATES.textErrorTryAgain,
                dialogConfig: {
                  textBtnCancel: null,
                },
              });
              Logger.error(new Error('Error upload dictionary'), { error: err }, [
                'DictionaryUploadFailed',
                (err && err.message) || 'NoMessage',
              ]);
              spinner.destroy();
            });
        },
      });
    }
  };

  const useControlledVocabularyLabel = (
    <span>
      {localization.TEAMMATES.labelUseControlled}{' '}
      <Tooltip content={localization.TEAMMATES.tooltipMessageAllows}>
        <span>
          <QuestionIcon className="svg-icon" />
        </span>
      </Tooltip>
    </span>
  );

  const manageKeywordsDenied = !isHaveTeammatePermission('manageKeywords');
  const manageBillingDenied = !isHaveTeammatePermission('manageBilling');
  const toggleUseControlledVocabulary = (value) => {
    userActions.savePolicy({ key: 'useKeywordsControlledVocabulary', value }, false);
  };

  const saveLocale = async (key, value) => {
    userActions.savePolicy({ key, value }, false);
  };

  const saveRelevance = async (key, value) => {
    userActions.savePolicy({ key, value }, false);
  };

  const handleUploadClick = (event) => {
    inputFileRef.current.click();
    event.preventDefault();
  };

  const changeAutoGenerationSettings = (value) => {
    const callback = () => {
      userActions.savePolicy({ key: 'autogenerateKeywords', value }, false);
    };

    if (value) {
      showDialog({
        title: localization.TEAMMATES.titleKeywordsAutogeneration,
        text: localization.TEAMMATES.textThisWillCost,
        textBtnOk: localization.TEAMMATES.btnActivate,
        textBtnCancel: localization.DIALOGS.btnCancel,
        onOk: () => {
          callback();
        },
      });
    } else {
      callback();
    }
  };

  return (
    <div className="userAIKeywordsTab">
      <div className="pageInnerContent">
        <div className="pageContainer">
          <div className="pageItem">
            <div className="pageItemTitle">
              {localization.TEAMMATES.textKeywordingTabTitle}
            </div>
            <AssetsKeywords
              team={user.team}
              className="pageItemBlock"
            />
            <If condition={!manageKeywordsDenied}>
              <div className="shortInput">
                <If condition={!manageBillingDenied}>
                  <div className="UITextarea__label">{localization.TEAMMATES.textBuyMoreKeywordCalls}</div>
                  <div className="keywordBuy">
                    <Select
                      onChange={(event) => {
                        setKeywordCallAmount(Number(event.target.value));
                      }}
                      options={keywordsCount}
                      value={keywordCallAmount}
                    />
                    <Button
                      id="button-buyKeywords"
                      variant="contained"
                      color="secondary"
                      onClick={handleBuyKeywords}
                      size="md"
                    >
                      {`Purchase for $${getPrice()}`}
                    </Button>
                  </div>
                </If>
              </div>
              <div className="pageItemBlock">
                <div className="pageTeam__settings__select">
                  <Select
                    label="Relevance:"
                    className="shortInput"
                    onChange={(event, value) => {
                      saveRelevance('keywordsRelevance', value);
                    }}
                    options={keywordsRelevancePercentage}
                    value={relevance}
                  />
                </div>
              </div>
              <div className="pageTeam__settings__select pageItemBlock">
                <div style={{ marginBottom: '5px' }}>{localization.TEAMMATES.textKeywordingLocale}</div>
                <Select
                  className="shortInput"
                  onChange={(event, value) => {
                    saveLocale('keywordingLocale', value);
                  }}
                  options={keywordingLocales}
                  value={keywordingLocale}
                />
              </div>
              <div className="pageItemTitle">
                {localization.TEAMMATES.textKeywordingTabControlledVocabularyTitle}
              </div>
              <div className="pageItemCheckbox">
                <Checkbox
                  label={localization.TEAMMATES.labelAutofill(summ)}
                  onChange={changeAutoGenerationSettings}
                  value={autogenerating}
                  disabled={manageBillingDenied}
                />
              </div>
              <div className="pageItemCheckbox">
                <Checkbox
                  label={useControlledVocabularyLabel}
                  onChange={toggleUseControlledVocabulary}
                  value={!!user.team.policies.useKeywordsControlledVocabulary}
                  disabled={manageKeywordsDenied}
                />
              </div>
              <If condition={!user.team.policies.useKeywordsControlledVocabulary}>
                <div className="btnsSelection">
                  <label htmlFor="uploadDictionary">
                    <input
                      type="file"
                      ref={inputFileRef}
                      style={{ display: 'none' }}
                      name="dictionary"
                      accept=".txt"
                      onChange={handleUploadChange}
                      id="uploadDictionary"
                    />
                    <Button
                      id="button-uploadDictionary"
                      variant="contained"
                      color="secondary"
                      onClick={handleUploadClick}
                      size="md"
                    >
                      {localization.TEAMMATES.textUploadDictionary}
                    </Button>
                  </label>
                </div>
              </If>
            </If>
          </div>
        </div>
      </div>
    </div>
  );
};

AIKeywords.propTypes = {
  subscriptionFeatures: PropTypes.objectOf(PropTypes.any).isRequired,
  user: PropTypes.objectOf(PropTypes.any).isRequired,
  buyKeywords: PropTypes.func.isRequired,
  addCard: PropTypes.func.isRequired,
  userActions: PropTypes.objectOf(PropTypes.func).isRequired,
};

export default AIKeywords;
