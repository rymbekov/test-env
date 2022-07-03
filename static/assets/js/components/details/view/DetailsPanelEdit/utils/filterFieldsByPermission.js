const checkPermission = (permission, permissions) => (permission ? permissions[permission] : true);

const filterFieldsByPermission = (fields, permissions) => fields.filter((field) => field && checkPermission(field.permission, permissions));

export default filterFieldsByPermission;
