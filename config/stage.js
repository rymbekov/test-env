module.exports = {
  ENV: 'stage',
  PUBSUB_URL: 'https://events.stage.pics.io',
  SHOW_PICSIO_DOMAIN: 'https://show.stage.pics.io',
  INBOX_PICSIO_DOMAIN: 'https://inboxes.stage.pics.io',
  APP_ID: '6183b6a4a15e03001d20bd90', /* CONNECTED APP ID */

  getApiBaseUrl() {
    if (window.Picsio && window.Picsio.apiBaseUrl) return window.Picsio.apiBaseUrl;
    return 'https://stage.pics.io';
  },

  getInboxApiBaseUrl() {
    return 'https://inboxes.stage.pics.io';
  },

  payments: {
    stripe: {
      PUBLISHABLE_KEY: 'pk_test_4WmYPFjLHNf2327g5YbiQs3U',
      FORM_IMAGE: 'https://assets.pics.io/img/favicon/faviconPicsio/apple-touch-icon-120x120.png',
      // to use development urls we can use runscope.com or localtunel.me
      SUBSCRIBE_URL: '/payments/stripe/subscribe',
      UNSUBSCRIBE_URL: '/payments/stripe/unsubscribe',
      COMMIT_CHARGE_URL: '/payments/stripe/commit',
      RESTORE_PAYMENT_URL: '/payments/stripe/restore',
      RETRIEVE_CUSTOMER_URL: '/payments/stripe/customer',
      CHANGE_CARD_URL: '/payments/stripe/changeCard',
      REDEEM_COUPON_URL: '/payments/stripe/redeem',
    },
  },
  intercom: {
    enabled: false,
    appId: 'sk5fmtnj',
  },
  proxy: {
    BASE_URL: 'https://proxystage.pics.io',
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
      URL: 'https://zipstage.pics.io/zip',
      URL_GD: 'https://gd-zipstage.pics.io/zip',
      URL_S3: 'https://s3-zipstage.pics.io/zip',
      DOWNLOAD_PAGE_URL: 'https://zipstage.pics.io/download.html',
      DOWNLOAD_BY_GS_URL: 'https://zipstage.pics.io/l/',
    },
    keyworder: {
      URL: 'https://54.221.215.161/keywords/analyze',
    },
    downloader: {
      URL: 'https://downloaderstage.pics.io/download/',
    },
  },
  events: {
    sessionKey: 'picsio.sid.s',
  },
  allowBrowserPushBySocket: false,
  vapid: {
    publicKey: 'BGsc1FV5mHY0792-nFdqVMYdCeiAQ1nz117z9RR9vp1oPucNJi-V8G-a-3UijXIs5shNtu2b0yJIPbZPv3TfRKo',
  },
};
