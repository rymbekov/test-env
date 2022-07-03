const getOptimisticReponse = path => ({
	optimistic: true,
	_id: (Math.floor(Math.random() * 10000000) + 1).toString(),
	path,
	createdAt: new Date(),
	updatedAt: new Date(),
});

export default getOptimisticReponse;
