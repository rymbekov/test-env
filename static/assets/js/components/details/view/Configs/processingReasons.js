import React from 'react';
import { navigate } from '../../../../helpers/history';

export default {
  BY_ACCOUNT_BALANCE: () => (
    <span>
      Keyword generation delayed for lack of credits. Click{' '}
      <span
        className="picsioLink"
        onClick={() => navigate('/teammates?tab=aiKeywords')}
      >
        here
      </span>{' '}
      to buy more API calls to Pics.io
    </span>
  ),
  BY_AUTO_KEYWORDING_SETTING: () => (
    <span>
      Keyword generation delayed for lack of credits. Click{' '}
      <span
        className="picsioLink"
        onClick={() => navigate('/teammates?tab=aiKeywords')}
      >
        here
      </span>{' '}
      to buy more API calls to Pics.io
    </span>
  ),
  BY_TEAM_POLICY: () => (
    <span>
      Keyword generation delayed because of team settings. Please shoot an email to{' '}
      <a className="picsioLink" href="mailto:support@pics.io">
        support@pics.io
      </a>{' '}
      if you want to clear up the issue.
    </span>
  ),
  BY_FILE_SIZE: () => (
    <span>
      Asset is too large for standard processing. Please shoot an email to{' '}
      <a className="picsioLink" href="mailto:support@pics.io">
        support@pics.io
      </a>{' '}
      if you want to have this issue solved.
    </span>
  ),
  BY_FILE_TYPE: () => (
    <span>
      File format is not supported for standard processing. Please shoot an email to{' '}
      <a className="picsioLink" href="mailto:support@pics.io">
        support@pics.io
      </a>{' '}
      if you want to have this issue solved.
    </span>
  ),
  BY_FILE_TYPE_THUMBNAILING: () => (
    <span>
      Pics.io failed to show the thumbnails of your assets. Please check your Storage account first
      and see if Storage has generated thumbnails for your assets. If you happen to have a problem
      with custom thumbnails types, please send a report to{' '}
      <a className="picsioLink" href="mailto:support@pics.io">
        support@pics.io
      </a>
      .
    </span>
  ),
  BY_FILE_TYPE_METADATING: () => (
    <span>
      Reading XMP/IPTC/EXIF metadata ran into a problem. Please shoot an email to{' '}
      <a className="picsioLink" href="mailto:support@pics.io">
        support@pics.io
      </a>{' '}
      if you want to have this issue solved.
    </span>
  ),
  BY_FILE_TYPE_KEYWORDING: () => (
    <span>
      Keyword generation ran into a problem. Please shoot an email to{' '}
      <a className="picsioLink" href="mailto:support@pics.io">
        support@pics.io
      </a>{' '}
      if you want to have this issue solved.
    </span>
  ),
  BY_SPACE_LIMIT: () => (
    <span>
      Cannot replicate an asset. Not enough space in your storage.
    </span>
  ),
  BY_FILE_TYPE_REPLICATING: () => (
    <span>
      Saving XMP/EXIF metadata to your Storage ran into a problem. Please shoot an email to{' '}
      <a className="picsioLink" href="mailto:support@pics.io">
        support@pics.io
      </a>{' '}
      if you want to have this issue solved.
    </span>
  ),
  BY_FILE_TYPE_CONTENTING: () => (
    <span>
      Preparing content for text search ran into a problem. Please shoot an email to{' '}
      <a className="picsioLink" href="mailto:support@pics.io">
        support@pics.io
      </a>{' '}
      if you want to have this issue solved.
    </span>
  ),
  BY_ACCOUNT_PLAN_LIMITS_METADATING: () => (
    <span>
      Reading XMP/IPTC/EXIF metadata of an asset is restricted. Please{' '}
      <span
        className="picsioLink"
        onClick={() => navigate('/billing?tab=overview')}
      >
        upgrade
      </span>{' '}
      plan to use this feature.
    </span>
  ),
  BY_ACCOUNT_PLAN_LIMITS_REPLICATING: () => (
    <span>
      Saving XMP/IPTC/EXIF metadata of an asset to your Storage is restricted. Please{' '}
      <span
        className="picsioLink"
        onClick={() => navigate('/billing?tab=overview')}
      >
        upgrade
      </span>{' '}
      plan to use this feature.
    </span>
  ),
  BY_ACCOUNT_PLAN_LIMITS_KEYWORDING: () => (
    <span>
      Autokeywording is restricted as you've reached 500 images limit. Please{' '}
      <span
        className="picsioLink"
        onClick={() => navigate('/billing?tab=overview')}
      >
        upgrade
      </span>{' '}
      plan to use this feature.
    </span>
  ),
  BY_ACCOUNT_PLAN_LIMITS_THUMBNAILING: () => (
    <span>
      Generating custom thumbnails of an asset is restricted. Please{' '}
      <span
        className="picsioLink"
        onClick={() => navigate('/billing?tab=overview')}
      >
        upgrade
      </span>{' '}
      plan to use this feature.
    </span>
  ),
  UNKNOWN: () => (
    <span>
      An error occurred during asset processing. Please shoot an email to{' '}
      <a className="picsioLink" href="mailto:support@pics.io">
        support@pics.io
      </a>{' '}
      and we’ll clear it up.
    </span>
  ),

  metadating: {
    MetadatingError: <span>Re-run metadata parsing.</span>,
    MalformedMetadata: (
      <span>
        Problem with metadata structure. Check this file at{' '}
        <a className="picsioLink" target="_blank" href="https://exiftool.org">
          https://exiftool.org
        </a>
        .{' '}
      </span>
    ),
    CorruptedOrUnsupportedFile: (
      <span>
        Most likely the problem here is in the software that generated this file. Try re-generating
        it in your software.
      </span>
    ),
    InvalidFileFormat: (
      <span>
        Check if files extension matches its format. A file can be a pdf but during renaming its
        filename may have been changed to “filename.jpg”.
      </span>
    ),
    DownloadError: (
      <span>Check if this file exists in your storage and if you have download permissions.</span>
    ),
    UnknownError: <span>Unknown error with reading metadata</span>,
  },

  replicating: {
    ReplicatingError: <span>Re-run metadata parsing.</span>,
    MalformedMetadata: (
      <span>
        Problem with metadata structure. Check this file at{' '}
        <a className="picsioLink" target="_blank" href="https://exiftool.org">
          https://exiftool.org
        </a>
        .{' '}
      </span>
    ),
    CorruptedOrUnsupportedFile: (
      <span>
        Most likely the problem here is in the software that generated this file. Try re-generating
        it in your software.
      </span>
    ),
    InvalidFileFormat: (
      <span>
        Check if files extension matches its format. A file can be a pdf but during renaming its
        filename may have been changed to “filename.jpg”.
      </span>
    ),
    DownloadError: (
      <span>Check if this file exists in your storage and if you have download permissions.</span>
    ),
    UploadError: (
      <span>Check if this file exists in your storage and if you have upload permissions.</span>
    ),
    UploadPermissionsError: <span>Check if a storage is connected and syncs with Pics.io.</span>,
    UploadQuotaError: <span>Check your storage space limits or daily upload quotas.</span>,
    UnknownError: <span>Unknown error with saving metadata</span>,
  },

  thumbnailing: {
    ThumbnailingError: <span>Re-run metadata parsing.</span>,
    MalformedMetadata: (
      <span>
        Problem with metadata structure. Check this file at{' '}
        <a className="picsioLink" target="_blank" href="https://exiftool.org">
          https://exiftool.org
        </a>
        .{' '}
      </span>
    ),
    CorruptedOrUnsupportedFile: (
      <span>
        Most likely the problem here is in the software that generated this file. Try re-generating
        it in your software.
      </span>
    ),
    InvalidFileFormat: (
      <span>
        Check if files extension matches its format. A file can be a pdf but during renaming its
        filename may have been changed to “filename.jpg”.
      </span>
    ),
    DownloadError: (
      <span>Check if this file exists in your storage and if you have download permissions.</span>
    ),
    UnknownError: <span>Unknown error with generating a thumbnail</span>,
  },
};
