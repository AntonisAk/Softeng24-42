const makeApiCall = require('../utils');

module.exports = async () => {
  const data = await makeApiCall('/admin/resetpasses', 'POST');
  console.log('Reset Passes:', data);
};