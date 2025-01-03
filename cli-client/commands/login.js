const makeApiCall = require('../utils');
const fs = require('fs');

module.exports = async (options) => {
  const data = await makeApiCall('/login', 'POST', {
    username: options.username,
    password: options.passw,
  });
  fs.writeFileSync('.auth_token', data.token);
  console.log('Login successful. Token saved.');
};