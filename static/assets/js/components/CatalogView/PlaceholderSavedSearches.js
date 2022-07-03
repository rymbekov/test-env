import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from '@picsio/ui';
import { useSelector } from 'react-redux';
import {
  Locked,
  File,
  FileAi,
  FilePs,
  FileRaw,
  FilePdf,
  FileVideo,
  FileTxt,
  FileXls,
  DateToday,
  DateEmpty,
  Public,
  Image,
  Shared,
  Stamper,
  Copy,
  User,
  Zero,
} from '@picsio/ui/dist/icons';
import Logger from '../../services/Logger';
import localization from '../../shared/strings';

const savedSearchesPlaceholders = {
  'Assigned to me': {
    title: (displayName) => localization.EMPTY_SEARCH.SAVED_SEARCHES.assigned(displayName),
    icon: <User />,
  },
  'Restricted assets': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.restricted,
    icon: <Locked />,
  },
  Uncategorized: {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.uncategorized,
    icon: <File />,
  },
  Spreadsheets: {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.spreadsheets,
    icon: <FileXls />,
  },
  'Corrupted files': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.corrupted,
    icon: <Zero />,
  },
  'JPG images': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.jpg,
    icon: <Image />,
  },
  'Text documents': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.text(),
    icon: <FileTxt />,
  },
  'PDF documents': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.pdf,
    icon: <FilePdf />,
  },
  'AI drawings': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.ai,
    icon: <FileAi />,
  },
  'Photoshop documents': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.photoshop,
    icon: <FilePs />,
  },
  'With GPS coordinates': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.gps,
    icon: <Public />,
  },
  'Without GPS coordinates': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.gpsno,
    icon: <Public />,
  },
  Video: {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.video,
    icon: <FileVideo />,
  },
  'Created today': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.createdToday,
    icon: <DateToday />,
  },
  'Created this week': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.createdWeek,
    icon: <DateEmpty />,
  },
  'Created this month': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.createdMonth,
    icon: <DateEmpty />,
  },
  Duplicates: {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.dublicates,
    icon: <Copy />,
  },
  'RAW images': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.raw,
    icon: <FileRaw />,
  },
  'Shared assets': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.shared,
    icon: <Shared />,
  },
  'Watermarked assets': {
    title: localization.EMPTY_SEARCH.SAVED_SEARCHES.watermarked,
    icon: <Stamper />,
  },
};

const PlaceholderSavedSearches = (props) => {
  const { name, goToLibrary } = props;
  const { displayName } = useSelector((state) => state.user);

  return (
    <>
      <div className="placeholderEmptyTitle">
        <Choose>
          <When condition={name === 'Assigned to me'}>
            {savedSearchesPlaceholders[name].title(displayName)}
          </When>
          <When condition={savedSearchesPlaceholders[name]}>
            <Choose>
              <When condition={typeof
              savedSearchesPlaceholders[name].title === 'function'}
              >
                {savedSearchesPlaceholders[name].title()}
              </When>
              <Otherwise>
                {savedSearchesPlaceholders[name].title}
              </Otherwise>
            </Choose>
          </When>
          <Otherwise>
            There are no files in this collection.<br />
            Click upward arrow in the toolbar below to upload files.
          </Otherwise>
        </Choose>
      </div>
      <div className="placeholderEmptyText">
        <Choose>
          <When condition={name === 'Assigned to me'}>
            Go to your{' '}
            <Button
              variant="text"
              color="primary"
              onClick={goToLibrary}
            >library
            </Button> and assign any asset to this user and they
            will show up here.<br /> More details on{' '}
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                window.open('https://help.pics.io/en/articles/1811252-saved-searches', '_blank');
                Logger.log('User', 'Help', name);
              }}
            >How to use saved searches
            </Button>.
          </When>
          <When condition={name === 'Watermarked assets'}>
            Go to your{' '}
            <Button
              variant="text"
              color="primary"
              onClick={goToLibrary}
            >library
            </Button> and assign any asset to this user and they
            will show up here.<br /> More details on{' '}
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                window.open('https://help.pics.io/en/articles/5695407-watermarking', '_blank');
                Logger.log('User', 'Help', name);
              }}
            >How to use watermarks
            </Button>.
          </When>
          <Otherwise>
            If there are any such assets in the future, they will show up here.<br />
            More details on{' '}
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                window.open('https://help.pics.io/en/articles/1811252-saved-searches', '_blank');
                Logger.log('User', 'Help', name);
              }}
            >How to use saved searches
            </Button>.
          </Otherwise>
        </Choose>
      </div>
      <div className="placeholderEmptyIcon">
        <Choose>
          <When condition={savedSearchesPlaceholders[name]}>
            <Icon color="inherit">
              {savedSearchesPlaceholders[name].icon}
            </Icon>
          </When>
          <Otherwise>
            {null}
          </Otherwise>
        </Choose>
      </div>
    </>
  );
};

PlaceholderSavedSearches.defaultProps = {
};

PlaceholderSavedSearches.propTypes = {
  name: PropTypes.string.isRequired,
  goToLibrary: PropTypes.func.isRequired,
};

export default PlaceholderSavedSearches;
