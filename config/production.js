module.exports = {
  ENV: 'production',
  PUBSUB_URL: 'https://events.pics.io',
  SHOW_PICSIO_DOMAIN: 'https://show.pics.io',
  INBOX_PICSIO_DOMAIN: 'https://inboxes.pics.io',
  APP_ID: '6183bd36220161001d647e07', /* CONNECTED APP ID */

  payments: {
    stripe: {
      FORM_IMAGE: 'https://assets.pics.io/img/favicon/faviconPicsio/apple-touch-icon-120x120.png',
      PUBLISHABLE_KEY: 'pk_live_4WmYqfZEe2LJmooWsAUsF3Cw', // test key for development will be overriden below
      COMMIT_CHARGE_URL: 'https://pics.io/payments/stripe/commit',
      SUBSCRIBE_URL: '/payments/stripe/subscribe',
      UNSUBSCRIBE_URL: '/payments/stripe/unsubscribe',
      RESTORE_PAYMENT_URL: 'https://pics.io/payments/stripe/restore',
      RETRIEVE_CUSTOMER_URL: '/payments/stripe/customer',
      CHANGE_CARD_URL: '/payments/stripe/changeCard',
      REDEEM_COUPON_URL: '/payments/stripe/redeem',
    },
  },
  proxy: {
    BASE_URL: 'https://proxy.pics.io',
  },
  intercom: {
    enabled: true,
    appId: 'flt8xv4y',
  },
  s3: {
    buckets: {
      customThumbnails: 'https://s3.amazonaws.com/thumbnails.pics.io',
    },
  },
  services: {
    thumbnailer: {
      URL: 'https://thumbs.pics.io/thumbnails/',
    },
    zipper: {
      URL: 'https://zip.pics.io/zip',
      URL_GD: 'https://gd-zip.pics.io/zip',
      URL_S3: 'https://s3-zip.pics.io/zip',
      DOWNLOAD_PAGE_URL: 'https://zip.pics.io/download.html',
      DOWNLOAD_BY_GS_URL: 'https://zip.pics.io/l/',
    },
    keyworder: {
      URL: 'https://keywords.pics.io/analyze',
    },
    downloader: {
      URL: 'https://downloader.pics.io/download/',
    },
  },
  events: {
    sessionKey: 'picsio.sid.p',
  },
  allowBrowserPushBySocket: false,
  vapid: {
    publicKey: 'BMaE_gKMXVR7t-L9Hlohxzg5YmKEf7ugfc3n0RMBLixZcfjrG9BqKnv0VtGQKU--p09D21e-YFra65nVSCPg63U',
  },
};
