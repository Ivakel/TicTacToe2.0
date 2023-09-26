const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    pool: {
      type: Array,
    },
  },
  {
    timestamp: true,
  }
);

const Pool = mongoose.model("Pool", Schema);

module.exports = Pool;
