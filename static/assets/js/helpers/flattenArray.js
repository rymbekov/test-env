const flattenArray = (data, fieldName = 'nodes') => data.reduce(function iter(r, a) {
  if (a === null) {
    return r;
  }
  if (a[fieldName]) {
    return a[fieldName].reduce(iter, r.concat(a));
  }
  return r.concat(a);
}, []);

export default flattenArray;
