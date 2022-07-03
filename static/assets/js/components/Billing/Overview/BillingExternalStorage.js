import React from 'react';

const BillingExternalStorage = () => (
  <div className="billingPlan__externalStorage">
    <div className="billingPlan__externalStorage-storage">
      <span className="billingPlan__externalStorage-storage-icon">
        <img
          src="https://assets.pics.io/img/gd.svg"
          style={{ width: '16px', height: '14px' }}
          className="svg-icon icon"
          alt="Google Drive"
        />
      </span>
      <span className="billingPlan__externalStorage-storage-text">
        Google Drive
      </span>
    </div>
    <div className="billingPlan__externalStorage-storage">
      <span className="billingPlan__externalStorage-storage-icon">
        <img
          src="https://assets.pics.io/img/s3.svg"
          style={{ width: '16px', height: '16px' }}
          className="svg-icon icon"
          alt="Amazon S3"
        />
      </span>
      <span className="billingPlan__externalStorage-storage-text">
        Amazon S3
      </span>
    </div>
  </div>
);

BillingExternalStorage.defaultProps = {};
BillingExternalStorage.propTypes = {};

export default BillingExternalStorage;
