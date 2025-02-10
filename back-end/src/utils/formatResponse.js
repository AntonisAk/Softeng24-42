const { stringify } = require("csv-stringify/sync");

function formatResponse(data, format = "json") {
  if (format === "csv") {
    if (!Array.isArray(data)) {
      data = [data];
    }

    // Handle two-level JSON structure
    const flattenedData = [];

    data.forEach((item) => {
      const baseProperties = {};
      const arrays = {};

      // Separate arrays from regular properties
      Object.entries(item).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          arrays[key] = value;
        } else {
          baseProperties[key] = value;
        }
      });

      // If no arrays found, just add the item as is
      if (Object.keys(arrays).length === 0) {
        flattenedData.push(baseProperties);
        return;
      }

      // Handle arrays - assuming only one array property (like passList)
      const arrayKey = Object.keys(arrays)[0];
      const arrayValues = arrays[arrayKey];

      // Create a row for each array item, combining base properties
      arrayValues.forEach((arrayItem) => {
        flattenedData.push({
          ...baseProperties,
          ...arrayItem,
        });
      });
    });

    return stringify(flattenedData, {
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
