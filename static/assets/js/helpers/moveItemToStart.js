function moveItemToEnd(input, index) {
  const arr = [...input];

  return [arr.splice(index, 1)[0], ...arr];
}

export default moveItemToEnd;
