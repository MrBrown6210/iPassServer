import mongoose from "mongoose";
const Schema = mongoose.Schema;
const Joi = require("joi");

const RecordSchema = new Schema(
  {
    device: {
      type: String,
      index: true,
      unique: true,
      trim: true,
    },
    data: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const Record = mongoose.model("Record", RecordSchema);
// function updateValidate(page) {
//     const schema = {};
//     return Joi.validate(page, schema);
// }

export { Record };

// exports.Record = Record;

// exports.validateOnCreate = validateOnCreate;
// exports.updateValidate = updateValidate;
