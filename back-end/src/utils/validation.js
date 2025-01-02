const Joi = require("joi");

const dateRegex = /^\d{8}$/;

const schemas = {
  stationDateParams: Joi.object({
    tollStationID: Joi.string().required(),
    date_from: Joi.string().pattern(dateRegex).required(),
    date_to: Joi.string().pattern(dateRegex).required(),
  }),

  passAnalysisParams: Joi.object({
    stationOpID: Joi.string().required(),
    tagOpID: Joi.string().required(),
    date_from: Joi.string().pattern(dateRegex).required(),
    date_to: Joi.string().pattern(dateRegex).required(),
  }),

  // Combined schema for passesCost route
  passesCostParams: Joi.object({
    tollOpID: Joi.string().required(),
    tagOpID: Joi.string().required(),
    date_from: Joi.string().pattern(dateRegex).required(),
    date_to: Joi.string().pattern(dateRegex).required(),
  }),

  // Combined schema for chargesBy route
  chargesByParams: Joi.object({
    tollOpID: Joi.string().required(),
    date_from: Joi.string().pattern(dateRegex).required(),
    date_to: Joi.string().pattern(dateRegex).required(),
  }),

  formatQuery: Joi.object({
    format: Joi.string().valid("json", "csv").default("json"),
  }),
};

module.exports = schemas;
