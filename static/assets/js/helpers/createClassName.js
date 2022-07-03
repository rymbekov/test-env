const createClassName = (className, element = '', state = '') => {
	if (element && state) {
		return `${className}__${element}--${state}`;
	} else if (element) {
		return `${className}__${element}`;
	} else if (state) {
		return `${className}--${state}`;
	}
	return className;
};

export default createClassName;
