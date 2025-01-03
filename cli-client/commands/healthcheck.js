const makeApiCall = require('../utils');

module.exports = async () => {
  const data = await makeApiCall('/admin/healthcheck');
  console.log('System Health:', data);
};
