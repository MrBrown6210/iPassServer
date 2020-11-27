import uniqueValidator from "mongoose-unique-validator";
import mongoose from "mongoose";
import { IIdentity, IPlace } from "../types";
const schema = mongoose.Schema;

interface IPersonDocument extends IIdentity, mongoose.Document {}

const Model = new schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
  email: {
    type: String,
  },
  offset: {
    type: String,
  },
});

Model.plugin(uniqueValidator);

export const Identity = mongoose.model<IPersonDocument>("Identity", Model);
