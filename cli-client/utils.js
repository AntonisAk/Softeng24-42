const axios = require('axios');

const BASE_URL = 'https://localhost:9115/api';

async function makeApiCall(endpoint, method = 'GET', data = null, headers = {}) {
  try {
    const options = {
      url: `${BASE_URL}${endpoint}`,
      method,
      headers,
      data,
    };
    const response = await axios(options);
    return response.data;
  } catch (error) {
    console.error(`Error: ${error.response?.data || error.message}`);
    process.exit(1);
  }
}

module.exports = makeApiCall;
