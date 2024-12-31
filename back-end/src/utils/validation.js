const Joi = require("joi");

const dateRegex = /^\d{8}$/;

const schemas = {
  dateParams: Joi.object({
    date_from: Joi.string().pattern(dateRegex).required(),
    date_to: Joi.string().pattern(dateRegex).required(),
  }),

  stationParams: Joi.object({
    tollStationID: Joi.string().required(),
  }),

  operatorParams: Joi.object({
    stationOpID: Joi.string().required(),
    tagOpID: Joi.string().required(),
  }),

  singleOperatorParams: Joi.object({
    tollOpID: Joi.string().required(),
  }),

  formatQuery: Joi.object({
    format: Joi.string().valid("json", "csv").default("json"),
  }),
};

module.exports = schemas;
