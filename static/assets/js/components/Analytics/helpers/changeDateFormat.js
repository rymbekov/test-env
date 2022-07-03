import dayjs from 'dayjs';
import uniqBy from 'lodash.uniqby';
import sortBy from 'lodash.sortby';

export const changeDateFormat = (metricsData, chartType) => {
	let fakeMetrics = [];

	for (let i = 0; i < 31; i++) {
		let newDate = new Date(2020, 5, i);

		if (i === 3) {
			fakeMetrics.push({
				date: dayjs(newDate).format('YYYY-MM-DD'),
				value: 0,
				// value: Math.round(0 - 0.5 + Math.random() * (2000 - 0 + 1)),
			});
		} else {
			fakeMetrics.push({
				date: dayjs(newDate).format('YYYY-MM-DD'),
				value: Math.round(0 - 0.5 + Math.random() * (2123 - 0 + 1)), // value resolution by Y axis
				// value: 0,
			});
		}
	}

	let dataArr = [];
	let rawData = metricsData.feed || [];
	// let rawData = fakeMetrics || [];

	if (rawData.length <= 7 && rawData.length !== 0) {
		let sorted = sortBy(rawData, ['date']);
		let lastElemDate = sorted[sorted.length - 1].date;

		sorted.forEach(i => {
			dataArr.push({ date: dayjs(i.date).format('YYYY-MM-DD'), value: i.value });
		});

		dataArr.push({
			date: dayjs(lastElemDate)
				.add(-6, 'day')
				.format('YYYY-MM-DD')
				.toString(),
			value: 0,
		});
	} else {
		rawData.forEach(i => {
			dataArr.push({ date: dayjs(i.date).format('YYYY-MM-DD'), value: i.value });
		});
	}

	let sortedMetricsData = sortBy(dataArr, ['date']);

	if (chartType === 'barChart') {
		return dataNormalizeBar(sortedMetricsData);
	} else if (chartType === 'lineChart') {
		return dataNormalizeLine(sortedMetricsData, metricsData.total);
	}
};

// for bar chart
const dataNormalizeBar = (data = []) => {
	if (data.length <= 0) {
		return data;
	}

	let dataWithoutHoles = [];
	let counter = 0;

	const haventDates = data.map(dates => dayjs(dates.date).format('YYYY-MM-DD'));
	let firsAndLastDates = sortBy(haventDates, ['date']);

	const date1 = dayjs(firsAndLastDates[0]);
	const date2 = dayjs(firsAndLastDates[firsAndLastDates.length - 1]);
	let dateDiff = date2.diff(date1, 'day');

	for (let i = 0; i <= dateDiff; i++) {
		let stringDate = dayjs(haventDates[0])
			.add(counter, 'day')
			.toString();
		const newDate = { date: dayjs(stringDate).format('YYYY-MM-DD'), value: 0 };

		if (!haventDates.includes(newDate.date)) {
			dataWithoutHoles.push(newDate);
		} else {
			const newDates = {
				date: newDate.date,
				value: data[haventDates.findIndex((item) => item === newDate.date)].value,
			};

			dataWithoutHoles.push(newDates);
		}

		counter++;
	}

	return dataWithoutHoles;
};

// for line chart
const dataNormalizeLine = (data = [], total) => {
	let dataWithoutHoles = dataNormalizeBar(data);

	let normalizedData = [];

	for (let i = 0; i <= dataWithoutHoles.length - 1; i++) {
		if (i !== 0) {
			if (dataWithoutHoles[i].value === 0) {
				normalizedData.push({
					x: dayjs(dataWithoutHoles[i].date).format('YYYY-MM-DD'),
					y: dataWithoutHoles[i - 1].value,
				});
			} else {
				normalizedData.push({ x: dayjs(dataWithoutHoles[i].date).format('YYYY-MM-DD'), y: dataWithoutHoles[i].value });
			}
		} else {
			normalizedData.push({
				x: dayjs(dataWithoutHoles[i].date).format('YYYY-MM-DD'),
				y: dataWithoutHoles[i].value,
			});
		}
	}

	let uniqData = uniqBy(normalizedData, 'x');
	let uniqAndSortedData = sortBy(uniqData, ['x']);

	return { data: uniqAndSortedData, total: total };
};
