import dayjs from 'dayjs';
import localization from '../../../shared/strings';

const today = dayjs().startOf('day');

export default [
  {
    value: 'any',
    text: localization.AUDIT.timeOptionsAny,
  },
  {
    value: 'today',
    text: localization.AUDIT.timeOptionsToday,
    range: [today.valueOf()],
  },
  {
    value: 'yesterday',
    text: localization.AUDIT.timeOptionsYesterday,
    range: [today.add(-1, 'day').valueOf(), today.valueOf()],
  },
  {
    value: 'last7',
    text: localization.AUDIT.timeOptionsLast7,
    range: [today.add(-7, 'day').valueOf()],
  },
  {
    value: 'last30',
    text: localization.AUDIT.timeOptionsLast30,
    range: [today.add(-30, 'day').valueOf()],
  },
  {
    value: 'last90',
    text: localization.AUDIT.timeOptionsLast90,
    range: [today.add(-90, 'day').valueOf()],
  },
  {
    value: 'custom',
    text: localization.AUDIT.timeOptionsCustomized,
  },
];
