import * as Api from './index';

const route = {
  // path: '/payments',
  path: '/billing',
  getProducts(withStorageProduct = 'false') {
    return Api.get(`${this.path}/stripe/products?withStorageProduct=${withStorageProduct}`);
  },
  /**
    * @param  { Object } data - object includes:
    *   planId - string; *required
    *   storagePlanId - string; optional
    *   tokenId - string; optional
    *   subscriptionOptions - object; optional
    *
  */
  subscribe(data) {
    return Api.post(`${this.path}/stripe/subscribe`, { data });
  },
  unsubscribe() {
    return Api.post(`${this.path}/stripe/unsubscribe`);
  },
  changeCard(cardOrToken) {
    return Api.post(`${this.path}/stripe/changeCard`, { data: { cardOrToken } });
  },
  redeemCoupon(coupon) {
    return Api.post(`${this.path}/stripe/redeem`, { data: { coupon } });
  },
  credits(amount) {
    return Api.put(`${this.path}/credits`, { data: { amount } });
  },
  freeRequest(name) {
    return Api.post(`${this.path}/freeRequest`, { data: { name } });
  },
  downgrade(currentPlanName, newPlanName) {
    return Api.post(`${this.path}/downgrade`, { data: { currentPlanName, newPlanName } });
  },
  storageRequest(name) {
    return Api.post(`${this.path}/storageRequest`, { data: { name } });
  },
  migrationRequest(storageName) {
    return Api.post(`${this.path}/migrationRequest`, { data: { storageName } });
  },
  buyKeywords(amount) {
    return Api.put(`${this.path}/assetsToKeywording`, { data: { amount } });
  },
};

export default route;
