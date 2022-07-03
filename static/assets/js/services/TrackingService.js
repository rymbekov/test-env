import _isObject from 'lodash/isObject';
import { emitFBEvent, fbEvents } from '../api/events';
import picsioConfig from '../../../../config';

/**
 * Tracking Service
 * This service tracks user actions and push events to GoogleAnalytics
 * @module Tracking Service
 */
const TrackingService = function () {
  /**
   * Send billing payment info to Google Analytics
   */
  const sendEcommerceToGA = (paymentData, price) => {
    return; // @TODO: needs to update on "gtag"
    if (picsioConfig.ENV !== 'production') return;
    if (typeof paymentData !== 'object') return;

    window._gaq.push([
      '_addTrans',
      paymentData.id, // transaction ID - required
      'Pics.io', // affiliation or store name
      price.toString(), // total - required;
    ]);
    window._gaq.push([
      '_addItem',
      paymentData.id, // transaction ID - necessary to associate item with transaction
      paymentData.sku, // SKU/code - required
      paymentData.name, // product name - necessary to associate revenue with product
      'Plan',
      price.toString(), // unit price - required
      '1', // quantity - required
    ]);
    window._gaq.push(['_trackTrans']);
  };

  const push = function (category, action, label, value, nonInteraction) {
    // replace category with overrided value if setted before
    // need for using events with correct category from different plugins
    category = this.category || category;
    label = _isObject(label) ? JSON.stringify(label) : label;
    label += ''; // label always should be string type. or push die

    nonInteraction = nonInteraction === true; // need for non interaction events

    const sendValue = typeof value === 'number' ? value : undefined;

    if (picsioConfig.ENV === 'production') {
      // old syntax
      // window._gaq.push(['_trackEvent', category, action, label, sendValue, nonInteraction]); // label will be set a bit later
      const trackingParams = {
        event_category: category,
        event_label: label,
        value: sendValue,
        non_interaction: nonInteraction,
      };
      window.gtag('event', action, trackingParams);

      // throw event to Facebook
      if (Object.keys(fbEvents).includes(action)) emitFBEvent(action, label);
    }
  };

  return {
    push,
    sendEcommerceToGA,
    trackableErrors: ['UnsupportedFormat'],
  };
};

export default new TrackingService();
