const makeApiCall = require('../utils');

module.exports = async (options) => {
  const endpoint = `/chargesBy/${options.opid}/${options.from}/${options.to}?format=${options.format}`;
  const data = await makeApiCall(endpoint);
  console.log(`Charges By (${options.format}):`, data);
};