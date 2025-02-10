const { stringify } = require("csv-stringify/sync");

function formatResponse(data, format = "json") {
  if (format === "csv") {
    if (!Array.isArray(data)) {
      if (typeof data === "object" && data !== null) {
        let csvData = [];
        let hasNestedArray = false;
        for (const key in data) {
          if (Array.isArray(data[key])) {
            hasNestedArray = true;
            const nestedArray = data[key];
            if (nestedArray.length > 0) {
              nestedArray.forEach((item) => {
                const row = {};
                for (const parentKey in data) {
                  if (parentKey !== key) {
                    // Exclude the nested array itself from parent properties
                    row[parentKey] = data[parentKey];
                  }
                }
                for (const itemKey in item) {
                  row[itemKey] = item[itemKey];
                }
                csvData.push(row);
              });
            } else {
              // Handle empty nested array case - output parent object row only if no other rows are generated
              if (csvData.length === 0) {
                csvData = [data]; // Or maybe don't output anything if the nested array is meant to be the primary data source. For now keep parent row.
              }
            }
            break; // Assuming only one nested array to process for flattening, if multiple, might need to rethink.
          }
        }
        if (!hasNestedArray) {
          csvData = [data]; // If no nested array found, treat as flat object
        }

        if (csvData.length > 0) {
          return stringify(csvData, { header: true, delimiter: "," });
        } else {
          return ""; // Return empty CSV if no data rows are generated, e.g., when nested array was empty and no parent data was meant to be output alone. Or return stringify([{}], {header: true}) for header only. For now return empty string.
        }
      } else {
        data = [data]; // For primitives or null, convert to array and stringify (might not be ideal, depends on expected input)
      }
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