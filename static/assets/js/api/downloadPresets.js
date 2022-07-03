import * as Api from './index';

const config = {
  route: '/downloadPresets',
  get() {
    return Api.get(this.route);
  },
  create(data) {
    return Api.post(this.route, { data });
  },
  update(presetId, data) {
    return Api.put(`${this.route}/${presetId}`, { data });
  },
  delete(presetId) {
    return Api.delete(`${this.route}/${presetId}`);
  },
};

export default config;
