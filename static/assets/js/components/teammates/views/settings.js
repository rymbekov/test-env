import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import publicDomains from '@picsio/db/src/helpers/publicDomains';
import { Checkbox, Select, Input, Textarea } from '../../../UIComponents'; // eslint-disable-line
import * as Api from '../../../api/team';
import CustomFieldsSelector from '../../CustomFieldsSelector';

import * as utils from '../../../shared/utils';
import localization from '../../../shared/strings';
import Logger from '../../../services/Logger';
import TagList from '../../TagList';

import store from '../../../store';
import * as userActions from '../../../store/actions/user';
import { isHaveTeammatePermission } from '../../../store/helpers/user';
import { setTeamName } from '../../../store/actions/collections';
import UpgradePlan from '../../UpgradePlan';

import CustomField from '../../Search/CustomField';
import { showDialog } from '../../dialog';

const setTeamNameAction = bindActionCreators({ setTeamName }, store.dispatch).setTeamName;

class Settings extends React.Component {
  state = {
    autoInvite: undefined,
    autoInviteRoleId: undefined,
    domainErrors: null,
    domains: [],
    restrictReason: '',
  };

  componentDidMount() {
    const domains = this.getInitialDomains();
    const policies = this.props.team.policies || {};
    const autoInvite = !!policies.autoInvite;
    const restrictReason = policies.restrictReason || localization.RESTRICT.RESTRICTED_REASON;
    this.setState({ domains, autoInvite, restrictReason });
  }

  getInitialDomains = () => {
    const {team} = this.props;
    // let domains = team.policies.domains || [{ name: team.email.replace(/.*@/, '') }];
    const domains = team.policies.domains || [];
    return domains.filter(domain => !publicDomains.includes(domain.name));
  };

  updateView = () => {
    this.setState(this.state);
  };

  renderCheckboxesList() {
    const { policies } = this.props.team;
    const { comments } = this.props.subscriptionFeatures;

    let requiredFields = {};
    if (policies) {
      requiredFields = {
        commentsRequired: policies.commentsRequired,
        titleAndDescriptionRequired: policies.titleAndDescriptionRequired,
        keywordsRequired: policies.keywordsRequired,
        assigneesRequired: policies.assigneesRequired,
        flagRequired: policies.flagRequired,
        ratingRequired: policies.ratingRequired,
        colorRequired: policies.colorRequired,
      };
    }

    return (
      <>
        <div className="pageItemCheckbox">
          <Checkbox
            label={localization.TEAMMATES.labelCommentRequired}
            onChange={value => this.setRequiredField('comments', value)}
            value={requiredFields.commentsRequired}
            disabled={!comments}
          />
          <If condition={!comments}>
            <UpgradePlan tooltip={localization.UPGRADE_PLAN.tooltipPlanLimitations} />
          </If>
        </div>
        <div className="pageItemCheckbox">
          <Checkbox
            label={localization.TEAMMATES.labelTitleAndDescriptionRequired}
            onChange={value => this.setRequiredField('titleAndDescription', value)}
            value={requiredFields.titleAndDescriptionRequired}
          />
        </div>
        <div className="pageItemCheckbox">
          <Checkbox
            label={localization.TEAMMATES.labelKeywordsRequired}
            onChange={value => this.setRequiredField('keywords', value)}
            value={requiredFields.keywordsRequired}
          />
        </div>
        <div className="pageItemCheckbox">
          <Checkbox
            label={localization.TEAMMATES.labelAssigneesRequired}
            onChange={value => this.setRequiredField('assignees', value)}
            value={requiredFields.assigneesRequired}
          />
        </div>
        <div className="pageItemCheckbox">
          <Checkbox
            label={localization.TEAMMATES.labelFlagRequired}
            onChange={value => this.setRequiredField('flag', value)}
            value={requiredFields.flagRequired}
          />
        </div>
        <div className="pageItemCheckbox">
          <Checkbox
            label={localization.TEAMMATES.labelRatingRequired}
            onChange={value => this.setRequiredField('rating', value)}
            value={requiredFields.ratingRequired}
          />
        </div>
        <div className="pageItemCheckbox">
          <Checkbox
            label={localization.TEAMMATES.labelColorRequired}
            onChange={value => this.setRequiredField('color', value)}
            value={requiredFields.colorRequired}
          />
        </div>
      </>
    );
  }

  saveSettings = async (key, value) => {
    this.props.userActions.savePolicy({ key, value }, false);
    if (key === 'teamName') setTeamNameAction(value);
  };

  setRequiredField = (name, value, subName = null) => {
    let key = `${name}Required`;
    Logger.log('User', 'SettingsMyTeamSettingsRequiredFieldsAnyCheckboxSelected', { name, value })

    if (subName) {
      key = `${key}.${subName}`;
    }
    this.props.userActions.savePolicy({ key, value }, false);
  };

  changeAutoGenerationSettings = value => {
    const callback = value => {
      this.props.userActions.savePolicy({ key: 'autogenerateKeywords', value }, false);
    };

    if (value) {
      showDialog({
        title: localization.TEAMMATES.titleKeywordsAutogeneration,
        text: localization.TEAMMATES.textThisWillCost,
        textBtnOk: localization.TEAMMATES.btnActivate,
        textBtnCancel: localization.DIALOGS.btnCancel,
        onOk: () => {
          callback(value);
        },
      });
    } else {
      callback(value);
    }
  };

  toggleUseControlledVocabulary = value => {
    this.props.userActions.savePolicy({ key: 'useKeywordsControlledVocabulary', value }, false);
  };

  saveDomains = async value => {
    let { domains, autoInvite } = this.state;

    Logger.log('User', 'SaveDomains', JSON.stringify(value));
    if (!Array.isArray(value)) {
      value = [value];
    }
    try {
      let updatedDomains = [];
      value.forEach(name => {
        const existingDomain = domains.find(domain => domain.name === name);
        if (existingDomain) {
          updatedDomains = [...updatedDomains, existingDomain];
        } else {
          updatedDomains = [...updatedDomains, { name }];
        }
      });

      if (value.length === 0) {
        autoInvite = false;
      }

      this.setState({ domains: [...updatedDomains], domainErrors: null, autoInvite });
      const result = await Api.setDomains({ domains: updatedDomains });
      if (result.success) {
        this.props.userActions.savePolicy({ key: 'domains', value: updatedDomains });
        if (!autoInvite) this.saveSettings('autoInvite', autoInvite);
      }
    } catch (error) {
      Logger.error(new Error('Error save domains'), { error }, [
        'SaveDomainsFailed',
        (error && error.message) || 'NoMessage',
      ]);
      const errors = utils.getDataFromResponceError(error, 'errors');
      this.setState({
        domains: [...domains],
        domainErrors: (errors && errors.length && errors.map(error => error.msg)) || [
          'Error save domains',
        ],
      });
    }
  };

  changeAutoInvite = value => {
    Logger.log('User', 'AutoInviteChange', { value });
    this.saveSettings('autoInvite', value);
    this.setState({ autoInvite: value });
  };

  calculateKeywordsSumm() {
    const { subscriptionFeatures } = this.props;
    const { pricePer1000Keywords } = subscriptionFeatures;

    return +pricePer1000Keywords / 100;
  }

  selectCustomField = ({ title }) => {
    this.setRequiredField('customFields', true, title);
  }

  deselectCustomField = ({ title }) => {
    this.setRequiredField('customFields', false, title);
  }

  getSelectedCustomFields = () => {
    const { team: { policies = {} } } = this.props;
    const { customFieldsRequired = {} } = policies;

    return Object.keys(customFieldsRequired).reduce((acc, title) => {
      const isSelected = customFieldsRequired[title];

      if (isSelected) {
        acc.push({ _id: title, title });
      }
      return acc;
    }, []);
  }

  render() {
    const { state, props } = this;
    const { domains, autoInvite } = state;
    const manageTeamDenied = !isHaveTeammatePermission('manageTeam');
    const policies = props.team.policies || {};
    const teamName = policies.teamName || 'My team';
    const {autoInviteRoleId} = policies;
    const selectedCustomFields = this.getSelectedCustomFields();
    const customFields = props.subscriptionFeatures?.customFields || false;

    const roleOptions = props.roles.map(role => {
      return {
        value: role._id,
        text: role.name,
      };
    });

    return (
      <div className="pageTabsContentPolicy">
        <div className="pageContainer pageTeam__settings">
          <If condition={!manageTeamDenied}>
            <div className="pageItem">
              <div className="pageItemTitle">{localization.TEAMMATES.titleSettingsName}</div>
              <Input
                label={localization.TEAMMATES.labelSettingsYourTeamName}
                className="mediumInput"
                defaultValue={teamName}
                onBlur={event => {
                  this.saveSettings('teamName', event.currentTarget.value || 'My team');
                }}
              />
            </div>
          </If>
          <div className="pageItem">
            <div className="pageItemTitle">{localization.TEAMMATES.titleSettingsDomain}</div>
            <TagList
              items={domains.map(domain => domain.name)}
              label={localization.TEAMMATES.labelSettingsYourDomains}
              placeholder={localization.TEAMMATES.placeholderEnterDomain}
              onSubmit={this.saveDomains}
              onBlur={this.saveDomains}
              itemType="domain"
              validate={utils.isValidDomain}
              className="mediumInput"
              errors={this.state.domainErrors}
            />
            <div className="pageItemCheckbox">
              <Checkbox
                label={localization.TEAMMATES.labelEnableAutoInvite}
                onChange={this.changeAutoInvite}
                disabled={!domains.length}
                value={autoInvite}
              />
            </div>
            {autoInvite && (
              <Select
                label={localization.TEAMMATES.labelSetDefaultRole}
                className="mediumInput"
                onChange={(event, value) => {
                  Logger.log('User', 'AutoInviteChangeDefaultRole');
                  this.saveSettings('autoInviteRoleId', value);
                }}
                options={roleOptions}
                value={autoInviteRoleId}
              />
            )}
          </div>
          <div className="pageItem">
            <div className="pageItemTitle">{localization.TEAMMATES.titleRequiredFields}</div>
            {this.renderCheckboxesList()}
            <div className="pageItemCustomFields">
              <div className="pageItemCustomFields">
                {selectedCustomFields.map(({ title }) => (
                  <CustomField key={title} title={title} onRemove={this.deselectCustomField} showInput={false} />
                ))}
              </div>
              <CustomFieldsSelector
                className="settingsCustomFields"
                title="Select custom fields"
                label="Select custom fields"
                selectedFields={selectedCustomFields}
                addField={this.selectCustomField}
                removeField={this.deselectCustomField}
                autoFocus
                eventName="SettingsMyTeamSettingsRequiredFieldsSelectCustomFieldsClicked"
                disabled={!customFields}
              />
            </div>
          </div>
          <div className="pageItem">
            <div className="pageItemTitle">{localization.TEAMMATES.titleRestrictReason}</div>
            <Textarea
              label={localization.TEAMMATES.labelRestrictReason}
              className="mediumInput"
              value={state.restrictReason}
              height={72}
              onChange={event => this.setState({ restrictReason: event.currentTarget.value || '' })}
              onBlur={event => {
                this.saveSettings('restrictReason', event.currentTarget.value || '');
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  team: state.user.team,
  roles: state.roles.items,
  subscriptionFeatures: state.user.subscriptionFeatures,
});
const mapDispatchToProps = dispatch => ({
  userActions: bindActionCreators(userActions, dispatch),
});
const ConnectedSettings = connect(mapStateToProps, mapDispatchToProps)(Settings);

export default props => <ConnectedSettings {...props} />;
