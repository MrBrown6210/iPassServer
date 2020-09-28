import uniqueValidator from "mongoose-unique-validator";
import mongoose from "mongoose";
import { ITrack } from "../types";
import { Place } from "./place.model";
import { riskPlacePointFromDurationInMinutes } from "../utils/point";
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
  },
  {
    timestamps: true,
  }
);

TrackModel.plugin(uniqueValidator);

TrackModel.pre<ITrackDocument>("save", async function(next) {
  const place = await Place.findOne({ uuid: this["owner"] });
  if (place) {
    console.log("stay1", this["stay"]);
    console.log("stay2", this.get("stay"));
    console.log("p", riskPlacePointFromDurationInMinutes(this["stay"] / 1000));
    this["point"] = riskPlacePointFromDurationInMinutes(this["stay"] / 1000);
    this.set("point", riskPlacePointFromDurationInMinutes(this["stay"] / 1000));
    console.log("point1", this["point"]);
    console.log("point2", this.get("point"));
  }
  console.log("place", place);
  next();
});

export const Track = mongoose.model<ITrackDocument>("Track", TrackModel);
