import React from 'react';

import { Input, Checkbox } from '../../../UIComponents';
import localization from '../../../shared/strings';

const WebsitesSEO = (props) => {
  const { handlers, website, errors } = props;

  return (
    <div className="pageTabsContent__mainOptions">
      <div className="pageWebsites__inputsBlock">
        <div className="pageItemTitle">{localization.WEBSITES.titleSeo}</div>
        <div className="pageWebsites__inputsBlock__content mediumInput">
          <Input
            placeholder="UA-XXXXXX"
            label={localization.WEBSITES.labelGoogleAnalIdentifier}
            value={website.googleAnalyticsIdentifier}
            onChange={handlers.onChangeGoogleAnaliticsIdentifier}
            onBlur={handlers.onSaveGoogleAnaliticsIdentifier}
            error={errors.googleAnalyticsIdentifier}
          />
          <Input
            placeholder={localization.WEBSITES.placeholderTitle}
            label={localization.WEBSITES.labelCustomGalleryTitle}
            value={website.customGalleryTitle}
            onChange={handlers.onChangeCustomGalleryTitle}
            onBlur={handlers.onSaveCustomGalleryTitle}
          />
          <br />
          <div className="pageWebsites__block__checkboxes">
            <div className="pageWebsites__block__checkboxTitleHolder">
              <div className="pageWebsites__block__checkboxTitle">{localization.WEBSITES.titleRobots}</div>
            </div>
            <div className="pageWebsites__block__checkbox">
              <span className="pageWebsites__block__checkboxLabel">{localization.WEBSITES.labelNoFollow}</span>
              <Checkbox
                value={website.noFollow}
                onChange={(value) => {
                  handlers.onChangeWebsiteData('noFollow', value);
                }}
              />
            </div>
            <div className="pageWebsites__block__checkbox">
              <span className="pageWebsites__block__checkboxLabel">{localization.WEBSITES.labelNoIndex}</span>
              <Checkbox
                value={website.noIndex}
                onChange={(value) => {
                  handlers.onChangeWebsiteData('noIndex', value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsitesSEO;
