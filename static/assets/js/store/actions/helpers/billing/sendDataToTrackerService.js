import TrackingService from '../../../../services/TrackingService';
import Logger from '../../../../services/Logger';

function sendDataToTrackingService(transactionId, planId, planName, interval, price) {
  const sku = planId === 'payg' ? 'payg' : `${planId}_${interval}`;
  Logger.log('User', 'SubscriptionChanged', planName);

  const paymentData = {
    id: transactionId,
    sku,
    name: planName,
  };

  TrackingService.sendEcommerceToGA(paymentData, price);
}

export default sendDataToTrackingService;
