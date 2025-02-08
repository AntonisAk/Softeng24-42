// covert Postman Api json documentation to OpenApi 3.0
const path = require("path");
const postmanToOpenApi = require("postman-to-openapi");

const postmanCollection = path.resolve(
  __dirname,
  "../../../api/InterPayTollApi.postman_collection.json"
);
const outputFile = path.resolve(
  __dirname,
  "../../../api/InterPayToll_openapi.yml"
);

async function convertCollection() {
  try {
    const result = await postmanToOpenApi(postmanCollection, outputFile, {
      defaultTag: "General",
    });
    console.log(`OpenAPI specs: ${result}`);
  } catch (err) {
    console.error("Conversion failed:", err);
  }
}

convertCollection();
