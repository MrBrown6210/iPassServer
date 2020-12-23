import uniqueValidator from "mongoose-unique-validator";
import mongoose from "mongoose";
import { ITrack } from "../types";
import { Place } from "./place.model";
import {
  riskPersonPointFromDurationInMinutes,
  riskPlacePointFromDurationInMinutes,
} from "../utils/point";
const schema = mongoose.Schema;

interface ITrackDocument extends ITrack, mongoose.Document {}

const TrackModel = new schema(
  {
    owner: {
      type: String,
      required: true,
      lowercase: true,
    },
    found: {
      type: String,
      required: true,
      lowercase: true,
    },
    leave_at: {
      type: Number,
      required: true,
    },
    stay: {
      type: Number,
      required: true,
    },
    point: {
      type: Number,
    },
    type: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

TrackModel.plugin(uniqueValidator);

export const Track = mongoose.model<ITrackDocument>("Track", TrackModel);
