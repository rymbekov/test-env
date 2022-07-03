module.exports = {
  ENV: 'development',
  PUBSUB_URL: 'http://localhost:8091',
  SHOW_PICSIO_DOMAIN: 'http://show.picsio.local:9003',
  INBOX_PICSIO_DOMAIN: 'http://inboxes.picsio.local:9004',
  APP_ID: '61689006b861f5efd076cabf', /* CONNECTED APP ID */

  getApiBaseUrl() {
    if (window.Picsio && window.Picsio.apiBaseUrl) return window.Picsio.apiBaseUrl;
    return location.protocol === 'https:' ? 'https://picsio.local:8081' : 'http://picsio.local:8081';
    // for build:mobile
    // return location.protocol === 'https:' ? 'https://localhost:8081' : 'http://localhost:8081';
  },

  getInboxApiBaseUrl() {
    return location.protocol === 'https:' ? 'https://inboxes.picsio.local:3064' : 'http://inboxes.picsio.local:3063';
  },

  payments: {
    stripe: {
      PUBLISHABLE_KEY: 'pk_test_2MNZCkekoHfh1jd6D309ogkE',
      FORM_IMAGE: 'https://assets.pics.io/img/favicon/faviconPicsio/apple-touch-icon-120x120.png',
      // to use development urls we can use runscope.com or localtunel.me
      SUBSCRIBE_URL: '/payments/stripe/subscribe',
      UNSUBSCRIBE_URL: '/payments/stripe/unsubscribe',
      COMMIT_CHARGE_URL: 'http://picsio.local/payments/stripe/commit',
      RESTORE_PAYMENT_URL: 'http://picsio.local/payments/stripe/restore',
      RETRIEVE_CUSTOMER_URL: '/payments/stripe/customer',
      CHANGE_CARD_URL: '/payments/stripe/changeCard',
      REDEEM_COUPON_URL: '/payments/stripe/redeem',
    },
  },
  proxy: {
    BASE_URL: 'http://localhost:3020',
  },
  intercom: {
    enabled: false,
    appId: 'sk5fmtnj',
  },
  s3: {
    buckets: {
      customThumbnails: 'https://s3.amazonaws.com/thumbnails.stage.pics.io',
    },
  },
  services: {
    thumbnailer: {
      URL: 'https://thumbs.pics.io/thumbnails/',
    },
    zipper: {
      URL: 'http://localhost:3003/zip',
      URL_GD: 'http://localhost:3003/zip',
      URL_S3: 'http://localhost:3003/zip',
      DOWNLOAD_BY_GS_URL: 'http://localhost:3003/l/',
      DOWNLOAD_PAGE_URL: 'http://localhost:3003/download.html',
    },
    keyworder: {
      URL: 'http://localhost:3008/analyze',
    },
    downloader: {
      URL: 'https://downloader.pics.io/download/',
    },
  },
  allowBrowserPushBySocket: false,
  vapid: {
    publicKey: 'BLx_l9Ekg7a2aXTuC69JmN6Kil5bZlQP0V4EBepBkjgckRCI_zd68KnBDgOgbBxZgfqp24dkMUTu5scaadNC2h0',
  },
};
