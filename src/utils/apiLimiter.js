const Bottleneck = require("bottleneck");

const limiter = new Bottleneck({
  minTime: 500, // allows for 2 requests per second which is the rapid API limit.
});

module.exports = limiter;
