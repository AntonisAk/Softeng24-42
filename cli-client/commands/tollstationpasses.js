  const makeApiCall = require('../utils');

  module.exports = async (options) => {
    console.log("Station:", options.station);  // Τύπωση της τιμής του station

    const endpoint = `/tollStationPasses/${options.station}/${options.from}/${options.to}?format=${options.format}`;
    const data = await makeApiCall(endpoint);
    console.log(`Toll Station Passes(${options.format}):`, data);
  };
