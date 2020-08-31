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
  },
  found: {
    type: String,
  },
  timestamp: {
    type: Number,
  },
  stay: {
    type: Number,
  },
});

export const Track = mongoose.model<ITrackDocument>("Track", TrackModel);
