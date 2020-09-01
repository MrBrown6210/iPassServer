import mongoose from "mongoose";
const schema = mongoose.Schema;

export interface ITrack {
  owner: string;
  found: string;
  timestamp: number;
  stay: number;
}

interface ITrackDocument extends ITrack, mongoose.Document {}

const TrackModel = new schema({
  owner: {
    type: String,
    required: true,
  },
  found: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  stay: {
    type: Number,
    required: true,
  },
});

export const Track = mongoose.model<ITrackDocument>("Track", TrackModel);
