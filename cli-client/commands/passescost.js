const makeApiCall = require('../utils');

module.exports = async (options) => {
  const endpoint = `/passesCost/${options.stationop}/${options.tagop}/${options.from}/${options.to}?format=${options.format}`;
  const data = await makeApiCall(endpoint);
  console.log(`Passes Cost (${options.format}):`, data);
};