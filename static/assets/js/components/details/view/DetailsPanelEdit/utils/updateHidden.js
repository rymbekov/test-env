const updateHidden = (hidden, checked, id) => {
  if (checked) {
    return hidden.filter((i) => i !== id);
  }
  return [...hidden, id];
};

export default updateHidden;
