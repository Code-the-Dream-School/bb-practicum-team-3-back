const isIncluded = (item) => {
  if (item === 1) {
    return "Yes";
  } else if (item === 0) {
    return "No";
  } else {
    return "Unknown";
  }
};

module.exports = isIncluded;
