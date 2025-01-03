const makeApiCall = require('../utils');

module.exports = async (options) => {
  const endpoint = `/passAnalysis/${options.stationop}/${options.tagop}/${options.from}/${options.to}?format=${options.format}`;
  const data = await makeApiCall(endpoint);
  console.log(`Pass Analysis (${options.format}):`, data);
};