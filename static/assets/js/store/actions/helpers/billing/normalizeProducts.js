import _replace from 'lodash/replace';
import _lowerFirst from 'lodash/lowerFirst';
import _sortBy from 'lodash/sortBy';
import _transform from 'lodash/transform';
import store from '../../../../store';
import { getUserStorageName } from '../../../helpers/user';
import localization from '../../../../shared/strings';
import planFeatures from '../../../../components/Billing/configs/planFeatures';

const unsupportedPlanIds = {
  gd: [], // user GoogleDrive storage
  s3: ['free', 'payg'], // user S3 storage
  picsioStorage: [], // Pics.io S3 storage
};

const checkPayGPlan = (plans) => plans[0].metadata.type === 'payg';

const normalizeMetadata = (metadata) => Object.keys(planFeatures).reduce((acc, key) => {
  if (key === 'inboxesLimit' && (metadata.inboxes === 'false' || metadata.inboxes === '0')) {
    acc[key] = { name: planFeatures[key].name, value: 'false' };
  } else if (key === 'roles' && metadata.rolesLimit === '1') {
    acc[key] = { name: planFeatures[key].name, value: 'false' };
  } else if (key === 'watermarksLimit') {
    acc[key] = {
      name: planFeatures[key].name,
      value: metadata.watermarksLimit === '1' || !metadata.watermarksLimit ? planFeatures[key].value : 'true',
      color: 'negative',
    };
  } else if (metadata[key] !== undefined) {
    acc[key] = { name: planFeatures[key].name, value: metadata[key] };
  } else {
    acc[key] = { name: planFeatures[key].name, value: planFeatures[key].value };
  }
  return acc;
}, {});

const getPlans = (productPlans) => productPlans.reduce((result, plan) => {
  const {
    id, nickname, interval, amount, metadata, active,
  } = plan;

  if (!active) return { ...result };

  const { externalStorage, 'ui:offer': additionalDescription } = metadata;

  return {
    ...result,
    [interval]: {
      id,
      nickname,
      interval,
      amount,
      metadata,
      features: normalizeMetadata(metadata),
      externalStorage,
      additionalDescription,
    },
  };
}, {});

const removeUnsupportedByStoragePlans = (plans) => {
  const { team } = store.getState().user;
  const storageName = getUserStorageName(team);
  if (unsupportedPlanIds[storageName]) {
    return plans.filter((plan) => !unsupportedPlanIds[storageName].includes(plan.id));
  }
  return plans;
};

function normalizeProducts({ products, storageProduct }) {
  const payGPlan = products.reduce(
    (acc, product) => {
      const { metadata, plans } = product;
      const isPayGPlan = checkPayGPlan(plans);

      if (isPayGPlan) {
        const isTeammates = plans[0].id.includes('teammates');
        const key = isTeammates ? 'teammates' : 'websites';

        // PAYG metadata is picked from the first plan (payg_teammates or payg_websites)
        // However, @picsio/stripe always uses payg_teammates to pcik metadata
        const paygMetadata = plans[0].metadata;
        const { externalStorage, 'ui:offer': additionalDescription } = paygMetadata;

        return {
          ...acc,
          metadata: { ...metadata, sortIndex: '0' },
          [key]: getPlans(plans),
          plans: {
            month: {
              features: normalizeMetadata(paygMetadata),
              metadata: paygMetadata,
              externalStorage,
              additionalDescription,
            },
          },
        };
      }

      return acc;
    },
    {
      planId: 'payg',
      id: 'payg',
      name: 'Pay As You Go',
      description: localization.BILLING.billingPlanDescription(null, null),
    },
  );

  const plans = products.reduce((acc, product) => {
    const {
      id: planId, name: productName, metadata, plans: productPlans,
    } = product;
    const isPayGPlan = checkPayGPlan(productPlans);

    if (!isPayGPlan) {
      const name = _replace(productName, ' 2019', '');
      const id = _lowerFirst(name);
      let description = productPlans[0].metadata['ui:description'];
      description = description?.split('\\n').join('<br />');

      const item = {
        planId,
        id,
        name,
        metadata,
        description,
        plans: getPlans(productPlans),
      };
      return [...acc, item];
    }
    return acc;
  }, []);

  const sortedPlans = removeUnsupportedByStoragePlans(
    _sortBy([...plans, payGPlan], 'metadata.sortIndex'),
  );

  if (storageProduct && storageProduct.length) {
    const storages = storageProduct[0].plans.reduce((acc, plan) => {
      const {
        id,
        product,
        amount,
        interval,
        metadata: { maxGB },
      } = plan;
      const number = +maxGB > 1000 ? Math.floor(+maxGB * 0.001) : +maxGB;
      const value = +maxGB < 1000 ? 'GB' : 'TB';
      const name = `${number} ${value}`;
      const prevItem = acc[maxGB] || {};
      const item = {
        ...prevItem,
        name,
        maxGB: +maxGB,
        [interval]: {
          planId: id,
          id,
          product,
          amount,
        },
      };

      return {
        ...acc,
        [maxGB]: item,
      };
    }, {});

    const storagesArray = _transform(
      storages,
      (acc, value) => {
        acc.push(value);
      },
      [],
    );
    const sortedStorages = _sortBy(storagesArray, 'maxGB');

    return {
      plans: sortedPlans,
      storages: sortedStorages,
    };
  }

  return {
    plans: sortedPlans,
    storages: [],
  };
}

export default normalizeProducts;
