const makeApiCall = require('../utils');

module.exports = async () => {
  const data = await makeApiCall('/admin/resetstations', 'POST');
  console.log('Reset Stations:', data);
};
