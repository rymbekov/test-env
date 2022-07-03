function swap(input, index_A, index_B) {
	const arr = [...input];
	let temp = arr[index_A];

	arr[index_A] = arr[index_B];
	arr[index_B] = temp;

	return arr;
}

export default swap;
