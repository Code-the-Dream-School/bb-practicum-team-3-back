const createTokenUser = (user) => {
  return { userId: user._id };
};

module.exports = createTokenUser;
