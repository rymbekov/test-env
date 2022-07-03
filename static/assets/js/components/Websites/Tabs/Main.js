import React from 'react';
import picsioConfig from '../../../../../../config';
import { Select, ImageSlider } from '../../../UIComponents';
import UrlEditor from '../../../UIComponents/UrlEditor';
import localization from '../../../shared/strings';

// eslint-disable-next-line react/prefer-stateless-function
export default class WebsitesMain extends React.Component {
  render() {
    const {
      templates, handlers, website, isDisabledCopy,
    } = this.props;

    const optionsSelect = templates.map((n) => ({
      value: n.key,
      text: `${n.title} - ${n.description}`,
    }));

    const optionsImageSlider = templates.map((n) => ({
      value: n.key,
      img: n.img,
      example: n.example,
    }));

    const teamDomains = (this.props.teamDomains
        && this.props.teamDomains.length
        && this.props.teamDomains.map((domain) => domain.name))
      || [];
    const showPicsioFullUrl = new URL(picsioConfig.SHOW_PICSIO_DOMAIN);
    const currentWebsiteDomain = website.alias.split('/')[0];
    const domains = [
      ...new Set([...teamDomains, showPicsioFullUrl.hostname, currentWebsiteDomain]),
    ];

    return (
      <div className="pageTabsContent__mainOptions">
        <div className="pageWebsites__inputsBlock">
          <div className="pageItemTitle">{localization.WEBSITES.titleMainOptions}</div>
          <div className="pageWebsites__inputsBlock__content">
            <div className="website-customization">
              <div className="website-customization-fields">
                <UrlEditor
                  id="website"
                  label={localization.WEBSITES.labelYourSiteLink}
                  disabled={false}
                  domains={domains}
                  selectedUrl={website.alias}
                  handleUrlChange={handlers.onChangeAlias}
                  isDisabledCopy={isDisabledCopy}
                  tooltipText={localization.DETAILS.disabledCopyWebsitesTooltipText}
                  toastText={localization.DETAILS.websiteUrlCopied}
                />
                <Select
                  label={localization.WEBSITES.labelSelectTemplate}
                  value={website.template}
                  options={optionsSelect}
                  onChange={(e, value) => {
                    handlers.onChangeTemplate(value);
                  }}
                />
              </div>
            </div>

            <ImageSlider
              value={website.template}
              options={optionsImageSlider}
              onChange={(e, value) => {
                handlers.onChangeTemplate(value);
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
