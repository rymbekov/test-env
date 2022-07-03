import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import isBetween from 'dayjs/plugin/isBetween';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import enGb from 'dayjs/locale/en-gb';
import de from 'dayjs/locale/de';
import store from '../store';

dayjs.extend(LocalizedFormat);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(relativeTime);

const allowedLocales = ['en-us', 'en-gb', 'de', 'de-de'];
const localesLikeUS = ['en', 'en-us', 'en-ca'];

const browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

const dateLocales = {
  'en-gb': {
    dateFormat: 'd MMM yyyy',
    timeFormat: 'HH:mm',
    placeholder: 'DD Mon YYYY',
    placeholderWithTime: 'DD Mon YYYY HH:mm',
    chartBottomAxis: '%d %b %Y',
  },
  'en-us': {
    dateFormat: 'MMM d, yyyy',
    timeFormat: 'h:mm aa',
    placeholder: 'Mon DD, YYYY',
    placeholderWithTime: 'Mon DD, YYYY, h:mm aa',
    chartBottomAxis: '%b %d %Y',
  },
  // customization for yeti
  de: {
    dateFormat: 'd. MMM yyyy',
    timeFormat: 'HH:mm',
    placeholder: 'DD. Mon YYYY',
    placeholderWithTime: 'DD. Mon YYYY HH:mm',
  },
};

let datePickerPlaceholder = dateLocales[getUserDateLocale()].placeholder;
let linearChartBottomAxis = dateLocales[getUserDateLocale()].chartBottomAxis;
let datePickerPlaceholderWithTime = dateLocales[getUserDateLocale()].placeholderWithTime;
let datePickerDateFormat = dateLocales[getUserDateLocale()].dateFormat;
let datePickerTimeFormat = dateLocales[getUserDateLocale()].timeFormat;

function getUserDateLocale() {
  const userSettings = (store && store.getState().user.settings) || {};
  const dateLocale = userSettings && userSettings.dateLocale;

  if (dateLocale && allowedLocales.includes(dateLocale.toLowerCase())) return dateLocale.toLowerCase();

  if (localesLikeUS.includes(browserLanguage.toLowerCase())) {
    return 'en-us';
  }
  return 'en-gb';
}

function setUserDateLocale(locale) {
  if (!locale) {
    locale = getUserDateLocale();
  }

  if (locale === 'en-gb') {
    dayjs.locale(enGb);
  } else if (locale === 'de' || locale === 'de-de') {
    locale = 'de';
    dayjs.locale(de);
  } else {
    dayjs.locale('en');
  }

  datePickerPlaceholder = dateLocales[locale].placeholder;
  linearChartBottomAxis = dateLocales[locale].chartBottomAxis;
  datePickerPlaceholderWithTime = dateLocales[locale].placeholderWithTime;
  datePickerDateFormat = dateLocales[locale].dateFormat;
  datePickerTimeFormat = dateLocales[locale].timeFormat;
  const event = new CustomEvent('userChangeDateLocale');
  window.dispatchEvent(event);
}

export {
  getUserDateLocale,
  setUserDateLocale,
  datePickerPlaceholder,
  linearChartBottomAxis,
  datePickerPlaceholderWithTime,
  datePickerDateFormat,
  datePickerTimeFormat,
};
