import dayjs from 'dayjs';

const axisFabric = arr => {
	let newArr = [];

	arr.forEach(i => {
		newArr.push({ date: dayjs(i.date).format('ll'), value: i.value });
	});

	return newArr;
};

export default axisFabric;
