import React from 'react';
import {
  number, object, oneOf, bool,
} from 'prop-types';
import { Hidden } from '@picsio/ui';
import ScaleSelect from './ScaleSelect';
import SpreadSelect from './SpreadSelect';
import SearchBar from './SearchBar';
import CurrentPage from './CurrentPage';

const Controls = ({
  viewer,
  eventBus,
  findController,
  currentPage,
  pagesCount,
  spreadMode,
  isDiff,
}) => (
  <div className="pdfViewerControls">
    <div className="pdfViewerControlsPart">
      <ScaleSelect eventBus={eventBus} viewer={viewer} />
      <If condition={!isDiff}>
        <SpreadSelect spreadMode={spreadMode} eventBus={eventBus} />
      </If>
    </div>
    <Hidden implementation="js" desktopDown>
      <div className="pdfViewerControlsPart">
        <CurrentPage
          viewer={viewer}
          currentPage={currentPage}
          pagesCount={pagesCount}
        />
      </div>
      <SearchBar eventBus={eventBus} controller={findController} />
    </Hidden>
  </div>
);

Controls.propTypes = {
  viewer: object.isRequired,
  eventBus: object.isRequired,
  findController: object.isRequired,
  currentPage: number.isRequired,
  pagesCount: number.isRequired,
  spreadMode: oneOf([0, 1, 2]),
  isDiff: bool,
};

Controls.defaultProps = {
  spreadMode: 0,
  isDiff: false,
};

export default Controls;
