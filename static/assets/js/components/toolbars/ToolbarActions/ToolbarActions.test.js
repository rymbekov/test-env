import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToolbarActions from './ToolbarActions';

const checkTooltip = async (buttonId, text) => {
  userEvent.hover(screen.getByTestId(buttonId));
  await waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument();
  });
  userEvent.unhover(screen.getByTestId(buttonId));
  await waitFor(() => {
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
};

const defaultTestProps = {
  allowedActions: {
    canBeCompared: true,
    deleteAssets: true,
    downloadFiles: true,
    editAssetCollections: true,
    isDownloadable: true,
    isRemovable: true,
    upload: true,
    websites: true,
  },
  diffTool: false,
  isArchiveView: false,
  isInboxView: false,
  rolePermissions: {
    manageArchive: true,
  },
  trashed: false,
  websitesAllowed: false,
  assetsActions: {
    deleteAssets: () => {},
    restoreAssets: () => {},
    trashAssets: () => {},
  },
  collectionsActions: {
    removeCollection: () => {},
  },
  archiveActions: {
    unarchiveCollection: () => {},
  },
  selectedAssetsIds: [],
};

const activeCollection = {
  _id: '123',
  name: 'Test collection',
  // children: PropTypes.arrayOf(PropTypes.object),
  path: '/',
  hasChild: false,
  archived: false,
  permissions: {
    upload: true,
    websites: true,
    moveCollections: true,
    downloadFiles: true,
    deleteCollections: true,
  },
};

describe('ToolbarActions', () => {
  it('Should render actions toolbar', () => {
    const props = {
      ...defaultTestProps,
      activeCollection,
    };

    render(<ToolbarActions {...props} />);
    expect(screen.getByTestId('toolbarActions')).toHaveClass('toolbarActionsWrapper');
  });

  it('Should not render actions toolbar', () => {
    const props = {
      ...defaultTestProps,
      activeCollection: null,
    };

    render(<ToolbarActions {...props} />);
    expect(screen.queryByTestId('toolbarActions')).not.toBeInTheDocument();
  });

  it('Should render actions toolbar for collections', () => {
    const props = {
      ...defaultTestProps,
      activeCollection,
      websitesAllowed: true,
    };

    render(<ToolbarActions {...props} />);
    expect(screen.getByTestId('toolbarActions')).toHaveClass('toolbarActionsWrapper');
    expect(screen.getByTestId('toolbarActionsCollections')).toHaveClass('toolbarActions');
    expect(screen.getByTestId('collectionUpload')).toBeInTheDocument();
    expect(screen.getByTestId('collectionShare')).toBeInTheDocument();
    expect(screen.getByTestId('collectionMove')).toBeInTheDocument();
    expect(screen.getByTestId('collectionDownload')).toBeInTheDocument();
    expect(screen.getByTestId('collectionArchive')).toBeInTheDocument();
    expect(screen.getByTestId('collectionDelete')).toBeInTheDocument();
  });

  it('Should render actions toolbar for assets', () => {
    const props = {
      ...defaultTestProps,
      activeCollection,
      selectedAssetsIds: ['1', '2', '3'],
    };

    render(<ToolbarActions {...props} />);
    expect(screen.getByTestId('toolbarActions')).toHaveClass('toolbarActionsWrapper');
    expect(screen.getByTestId('toolbarActionsAssets')).toHaveClass('toolbarActions');
  });

  it('Should buttons be disabled', () => {
    const props = {
      ...defaultTestProps,
      activeCollection,
      diffTool: true,
      allowedActions: {
        ...defaultTestProps.allowedActions,
        canBeCompared: false,
      },
      selectedAssetsIds: ['1', '2', '3'],
    };

    render(<ToolbarActions {...props} />);
    expect(screen.getByTestId('assetsCompare')).toBeDisabled();
    expect(screen.getByTestId('assetShare')).toBeDisabled();
    expect(screen.getByTestId('assetAddRevision')).toBeDisabled();
  });

  it('Should buttons be enabled', () => {
    const props = {
      ...defaultTestProps,
      activeCollection,
      diffTool: true,
      websitesAllowed: true,
      selectedAssetsIds: ['1', '2'],
    };

    render(<ToolbarActions {...props} />);

    expect(screen.getByTestId('assetsDownload')).not.toBeDisabled();
    expect(screen.getByTestId('assetsAttachCollection')).not.toBeDisabled();
    expect(screen.getByTestId('assetsDelete')).not.toBeDisabled();
    expect(screen.getByTestId('assetsArchive')).not.toBeDisabled();
    expect(screen.getByTestId('assetsCompare')).not.toBeDisabled();
  });

  it('Should be show tooltips for 1 asset', async () => {
    const props = {
      ...defaultTestProps,
      activeCollection,
      diffTool: true,
      selectedAssetsIds: ['1'],
    };

    render(<ToolbarActions {...props} />);

    await checkTooltip('assetShare', 'Share asset');
    await checkTooltip('assetsDownload', 'Download');
    await checkTooltip('assetsCompare', 'Select a second asset to enable comparison tool');
    await checkTooltip('assetsAttachCollection', 'Attach collection');
    await checkTooltip('assetsDelete', 'Move to trash');
    await checkTooltip('assetsArchive', 'Archive');
  });

  it('Should be show tooltips for 2 assets', async () => {
    const props = {
      ...defaultTestProps,
      activeCollection,
      diffTool: true,
      selectedAssetsIds: ['1', '2'],
    };

    render(<ToolbarActions {...props} />);

    await checkTooltip('assetsDownload', 'Download');
    await checkTooltip('assetsCompare', 'Compare');
    await checkTooltip('assetsAttachCollection', 'Attach collection');
    await checkTooltip('assetsDelete', 'Move to trash');
    await checkTooltip('assetsArchive', 'Archive');
  });
});
