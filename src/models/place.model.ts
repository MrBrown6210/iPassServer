import uniqueValidator from "mongoose-unique-validator";
import mongoose from "mongoose";
import { IPlace } from "../types";
const schema = mongoose.Schema;

interface IPlaceDocument extends IPlace, mongoose.Document {}

const PlaceModel = new schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
});

PlaceModel.plugin(uniqueValidator);

export const Place = mongoose.model<IPlaceDocument>("Place", PlaceModel);
