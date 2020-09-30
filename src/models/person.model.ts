import uniqueValidator from "mongoose-unique-validator";
import mongoose from "mongoose";
import { IPerson, IPlace } from "../types";
const schema = mongoose.Schema;

interface IPersonDocument extends IPerson, mongoose.Document {}

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
});

Model.plugin(uniqueValidator);

export const Person = mongoose.model<IPersonDocument>("Person", Model);
