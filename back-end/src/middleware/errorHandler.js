const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.type === "ValidationError") {
    return res.status(400).json({
      status: "failed",
      info: err.message,
    });
  }

  // Handle specific error types based on status codes from specs
  switch (err.status) {
    case 400:
      return res.status(400).json({
        status: "failed",
        info: "Bad request - Invalid parameters",
      });
    case 401:
      return res.status(401).json({
        status: "failed",
        info: "Not authorized",
      });
    default:
      return res.status(500).json({
        status: "failed",
        info: "Internal server error",
      });
  }
};

module.exports = { errorHandler };
