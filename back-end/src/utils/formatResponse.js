const { stringify } = require("csv-stringify/sync");

function formatResponse(data, format = "json") {
  if (format === "csv") {
    if (!Array.isArray(data)) {
      // Convert single object to array for CSV conversion
      data = [data];
    }
    return stringify(data, {
      header: true,
      delimiter: ",",
    });
  }
  return data;
}

function getContentType(format) {
  return format === "csv" ? "text/csv" : "application/json";
}

module.exports = {
  formatResponse,
  getContentType,
};
