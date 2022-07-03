function moveItemToEnd(input, index) {
  const arr = [...input];
  arr.push(arr.splice(index, 1)[0]);

  return arr;
}

export default moveItemToEnd;
