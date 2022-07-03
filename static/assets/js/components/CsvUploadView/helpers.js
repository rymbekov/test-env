export const validateCsvFile = (file) => file.type !== 'text/csv' || file.size === 0 || file.size > 20000000;
